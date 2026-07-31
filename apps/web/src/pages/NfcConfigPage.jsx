import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

const NFC_PUBLIC_BASE_URL = (
    import.meta.env.VITE_NFC_PUBLIC_BASE_URL ||
    "https://cesta-garquins.vercel.app"
).replace(/\/$/, "");

function NfcConfigPage() {
    const [tags, setTags] = useState([]);
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingTagId, setDeletingTagId] = useState(null);
    const [editingTagId, setEditingTagId] = useState(null);
    const [editingItemName, setEditingItemName] = useState("");
    const [editingQuantity, setEditingQuantity] = useState(1);
    const [editingActive, setEditingActive] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const activeCount = useMemo(
        () => tags.filter((tag) => tag.isActive).length,
        [tags]
    );

    async function loadTags() {
        try {
            setLoading(true);
            setError("");
            const data = await apiRequest("/nfc/tags");
            setTags(data.tags || []);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTags();
    }, []);

    async function handleCreateTag(event) {
        event.preventDefault();

        const nextItemName = itemName.trim();
        const nextQuantity = Number(quantity);

        if (!nextItemName || !Number.isFinite(nextQuantity) || nextQuantity < 1) {
            setError("Rellena producto y cantidad valida.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const data = await apiRequest("/nfc/tags", {
                method: "POST",
                body: JSON.stringify({
                    itemName: nextItemName,
                    quantity: nextQuantity,
                    isActive: true
                })
            });

            setItemName("");
            setQuantity(1);
            await loadTags();
            setSuccess(`Pegatina NFC creada. Token: ${data.tag.token}`);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    }

    function startEditing(tag) {
        setEditingTagId(tag.id);
        setEditingItemName(tag.itemName);
        setEditingQuantity(tag.quantity);
        setEditingActive(tag.isActive);
        setError("");
        setSuccess("");
    }

    function cancelEditing() {
        setEditingTagId(null);
        setEditingItemName("");
        setEditingQuantity(1);
        setEditingActive(true);
    }

    async function saveEditing(tagId) {
        const nextQuantity = Number(editingQuantity);

        if (!editingItemName.trim() || !Number.isFinite(nextQuantity) || nextQuantity < 1) {
            setError("Producto y cantidad valida son obligatorios.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await apiRequest(`/nfc/tags/${tagId}`, {
                method: "PATCH",
                body: JSON.stringify({
                    itemName: editingItemName.trim(),
                    quantity: nextQuantity,
                    isActive: editingActive
                })
            });

            await loadTags();
            cancelEditing();
            setSuccess("Pegatina NFC actualizada.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    }

    function buildNfcUrl(tokenValue) {
        return `${NFC_PUBLIC_BASE_URL}/nfc/${tokenValue}`;
    }

    async function copyTagUrl(tag) {
        const url = buildNfcUrl(tag.token);

        try {
            await navigator.clipboard.writeText(url);
            setSuccess(`URL copiada: ${url}`);
            setError("");
        } catch {
            setError("No se pudo copiar la URL automaticamente.");
        }
    }

    async function deleteTag(tag) {
        const confirmed = window.confirm(
            `¿Seguro que quieres eliminar la pegatina ${tag.token} (${tag.itemName})?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingTagId(tag.id);
            setError("");
            setSuccess("");

            await apiRequest(`/nfc/tags/${tag.id}`, {
                method: "DELETE"
            });

            if (editingTagId === tag.id) {
                cancelEditing();
            }

            await loadTags();
            setSuccess("Pegatina NFC eliminada correctamente.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setDeletingTagId(null);
        }
    }

    return (
        <section className="nfc-config-page">
            <section className="panel panel--hero">
                <div>
                    <p className="eyebrow">NFC</p>
                    <h2>Configura tus pegatinas</h2>
                    <p>
                        Asocia cada token NFC a un producto y una cantidad para anadirlo a la lista al escanear.
                    </p>
                </div>
                <div className="summary-chip">
                    <strong>{activeCount}</strong>
                    <span>activas</span>
                </div>
            </section>

            <section className="panel panel--stacked">
                <div className="section-header">
                    <div>
                        <h3>Nueva pegatina</h3>
                        <p className="section-subtitle">Vincula producto y cantidad (token automatico)</p>
                    </div>
                </div>

                <form className="inline-form inline-form--nfc" onSubmit={handleCreateTag}>
                    <input
                        value={itemName}
                        onChange={(event) => setItemName(event.target.value)}
                        placeholder="Producto"
                    />
                    <input
                        className="quantity-input quantity-input--form"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        aria-label="Cantidad"
                    />
                    <button type="submit" className="secondary-button" disabled={saving}>
                        {saving ? "Guardando..." : "Crear"}
                    </button>
                </form>

                {error && <p className="error-text">{error}</p>}
                {success && <p className="success-text">{success}</p>}
            </section>

            <section className="panel panel--stacked">
                <div className="section-header">
                    <div>
                        <h3>Pegatinas configuradas</h3>
                        <p className="section-subtitle">Edita producto, cantidad y estado</p>
                    </div>
                    <span className="count-pill">{tags.length}</span>
                </div>

                {loading ? (
                    <p className="empty-state">Cargando pegatinas...</p>
                ) : tags.length ? (
                    <ul className="item-list">
                        {tags.map((tag) => {
                            const isEditing = editingTagId === tag.id;

                            return (
                                <li
                                    key={tag.id}
                                    className={`item-row nfc-row-copy ${tag.isActive ? "" : "item-row--muted"}`}
                                    onClick={() => {
                                        if (!isEditing) {
                                            copyTagUrl(tag);
                                        }
                                    }}
                                    onKeyDown={(event) => {
                                        if (!isEditing && (event.key === "Enter" || event.key === " ")) {
                                            event.preventDefault();
                                            copyTagUrl(tag);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    title="Pulsa para copiar la URL NFC"
                                >
                                    <span className={`item-bullet ${tag.isActive ? "" : "item-bullet--muted"}`} />
                                    <div className="item-main">
                                        <strong>{tag.token}</strong>
                                        <span className="item-meta">
                                            {tag.isActive ? "Activa" : "Inactiva"}
                                            {tag.lastUsedAt ? ` · Ultimo uso: ${new Date(tag.lastUsedAt).toLocaleString()}` : ""}
                                        </span>
                                    </div>

                                    {isEditing ? (
                                        <div className="nfc-edit-grid">
                                            <input
                                                value={editingItemName}
                                                onChange={(event) => setEditingItemName(event.target.value)}
                                                placeholder="Producto"
                                            />
                                            <input
                                                type="number"
                                                min="1"
                                                value={editingQuantity}
                                                onChange={(event) => setEditingQuantity(event.target.value)}
                                                className="quantity-input"
                                            />
                                            <label className="nfc-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={editingActive}
                                                    onChange={(event) => setEditingActive(event.target.checked)}
                                                />
                                                Activa
                                            </label>
                                        </div>
                                    ) : (
                                        <span className="item-meta">{tag.itemName} x{tag.quantity}</span>
                                    )}

                                    {isEditing ? (
                                        <div className="nfc-actions">
                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    saveEditing(tag.id);
                                                }}
                                                disabled={saving}
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                type="button"
                                                className="icon-button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    cancelEditing();
                                                }}
                                                disabled={saving || deletingTagId === tag.id}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                className="secondary-button secondary-button--danger"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    deleteTag(tag);
                                                }}
                                                disabled={saving || deletingTagId === tag.id}
                                            >
                                                {deletingTagId === tag.id ? "Eliminando..." : "Eliminar"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="nfc-actions">
                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    startEditing(tag);
                                                }}
                                                disabled={deletingTagId === tag.id}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="secondary-button secondary-button--danger"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    deleteTag(tag);
                                                }}
                                                disabled={deletingTagId === tag.id}
                                            >
                                                {deletingTagId === tag.id ? "Eliminando..." : "Eliminar"}
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="empty-state">No hay pegatinas configuradas todavia.</p>
                )}
            </section>
        </section>
    );
}

export default NfcConfigPage;
