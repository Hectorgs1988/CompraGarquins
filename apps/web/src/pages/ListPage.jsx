import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

function ListPage() {
    const [itemName, setItemName] = useState("");
    const [itemQuantity, setItemQuantity] = useState(1);
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    const [savingItemId, setSavingItemId] = useState(null);
    const [finalizing, setFinalizing] = useState(false);
    const [quantityDrafts, setQuantityDrafts] = useState({});

    async function loadItems() {
        try {
            setError("");
            const data = await apiRequest("/list");
            setItems(data.items || []);
            setQuantityDrafts((currentDrafts) => {
                const nextDrafts = {};

                (data.items || []).forEach((entry) => {
                    nextDrafts[entry.id] = currentDrafts[entry.id] ?? entry.quantity ?? 1;
                });

                return nextDrafts;
            });
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    const { listItems, basketItems } = useMemo(() => {
        const grouped = { listItems: [], basketItems: [] };

        items.forEach((entry) => {
            if (entry.status === "basket") {
                grouped.basketItems.push(entry);
            } else {
                grouped.listItems.push(entry);
            }
        });

        return grouped;
    }, [items]);

    useEffect(() => {
        loadItems();

        const handleListUpdated = () => {
            loadItems();
        };

        window.addEventListener("cesta:list-updated", handleListUpdated);

        return () => {
            window.removeEventListener("cesta:list-updated", handleListUpdated);
        };
    }, []);

    async function addItem(event) {
        event.preventDefault();
        const nextItem = itemName.trim();
        if (!nextItem) {
            return;
        }

        const safeQuantity = Number.isFinite(Number(itemQuantity)) && Number(itemQuantity) > 0
            ? Number(itemQuantity)
            : 1;

        try {
            setError("");
            await apiRequest("/list", {
                method: "POST",
                body: JSON.stringify({ name: nextItem, quantity: safeQuantity })
            });
            setItemName("");
            setItemQuantity(1);
            await loadItems();
            window.dispatchEvent(new CustomEvent("cesta:list-updated"));
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function deleteItem(itemId, itemName) {
        const confirmed = window.confirm(
            `¿Seguro que quieres eliminar "${itemName}" de la lista?`
        );

        if (!confirmed) {
            return false;
        }

        try {
            setSavingItemId(itemId);
            setError("");
            await apiRequest(`/list/${itemId}`, { method: "DELETE" });
            await loadItems();
            window.dispatchEvent(new CustomEvent("cesta:list-updated"));
            return true;
        } catch (requestError) {
            setError(requestError.message);
            return false;
        } finally {
            setSavingItemId(null);
        }
    }

    async function updateQuantity(itemId) {
        const nextQuantity = Number(quantityDrafts[itemId]);

        if (!Number.isFinite(nextQuantity)) {
            return;
        }

        if (nextQuantity <= 0) {
            const entry = items.find((currentItem) => currentItem.id === itemId);
            await deleteItem(itemId, entry?.name || "este producto");
            return;
        }

        try {
            setSavingItemId(itemId);
            setError("");
            await apiRequest(`/list/${itemId}`, {
                method: "PATCH",
                body: JSON.stringify({ quantity: nextQuantity })
            });
            await loadItems();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSavingItemId(null);
        }
    }

    async function moveToBasket(itemId) {
        try {
            setSavingItemId(itemId);
            setError("");
            await apiRequest(`/list/${itemId}/cart`, { method: "POST" });
            await loadItems();
            window.dispatchEvent(new CustomEvent("cesta:list-updated"));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSavingItemId(null);
        }
    }

    async function restoreToList(itemId) {
        try {
            setSavingItemId(itemId);
            setError("");
            await apiRequest(`/list/${itemId}/restore`, { method: "POST" });
            await loadItems();
            window.dispatchEvent(new CustomEvent("cesta:list-updated"));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSavingItemId(null);
        }
    }

    async function finalizePurchase() {
        try {
            setFinalizing(true);
            setError("");
            await apiRequest("/list/finalize", { method: "POST" });
            await loadItems();
            window.dispatchEvent(new CustomEvent("cesta:list-updated"));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setFinalizing(false);
        }
    }

    function renderQuantityControls(entry) {
        const draftQuantity = quantityDrafts[entry.id] ?? entry.quantity ?? 1;

        return (
            <div className="quantity-controls">
                <button
                    type="button"
                    className="icon-button"
                    onClick={async () => {
                        const currentQuantity = Number(draftQuantity);

                        if (currentQuantity <= 1) {
                            await deleteItem(entry.id, entry.name);
                            return;
                        }

                        const nextQuantity = currentQuantity - 1;
                        setQuantityDrafts((current) => ({ ...current, [entry.id]: nextQuantity }));
                    }}
                    disabled={savingItemId === entry.id}
                >
                    -
                </button>
                <input
                    className="quantity-input"
                    type="number"
                    min="1"
                    value={draftQuantity}
                    onChange={(event) => {
                        const nextQuantity = event.target.value;
                        setQuantityDrafts((current) => ({ ...current, [entry.id]: nextQuantity }));
                    }}
                    onBlur={() => updateQuantity(entry.id)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.currentTarget.blur();
                        }
                    }}
                />
                <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                        const nextQuantity = Number(draftQuantity) + 1;
                        setQuantityDrafts((current) => ({ ...current, [entry.id]: nextQuantity }));
                    }}
                    disabled={savingItemId === entry.id}
                >
                    +
                </button>
            </div>
        );
    }

    return (
        <section className="list-page">
            <div className="panel panel--hero">
                <div>
                    <p className="eyebrow">Lista de la compra</p>
                    <h2>Productos pendientes y cesta</h2>
                    <p>
                        Añade productos manualmente o con NFC, muévelos a la cesta cuando los cojas y finaliza la compra para limpiar lo comprado.
                    </p>
                </div>
                <div className="summary-chip">
                    <strong>{listItems.length}</strong>
                    <span>pendientes</span>
                </div>
            </div>

            <section className="panel panel--stacked">
                <h3>Añadir producto</h3>
                <form className="inline-form inline-form--list" onSubmit={addItem}>
                    <input
                        value={itemName}
                        onChange={(event) => setItemName(event.target.value)}
                        placeholder="Ej. Leche"
                    />
                    <input
                        className="quantity-input quantity-input--form"
                        type="number"
                        min="1"
                        value={itemQuantity}
                        onChange={(event) => setItemQuantity(event.target.value)}
                        aria-label="Cantidad"
                    />
                    <button type="submit">Añadir</button>
                </form>
            </section>

            <div className="list-layout">
                <section className="panel list-panel">
                    <div className="section-header">
                        <div>
                            <h3>En la lista</h3>
                            <p className="section-subtitle">Pendientes de coger en el supermercado</p>
                        </div>
                        <span className="count-pill">{listItems.length}</span>
                    </div>

                    {listItems.length ? (
                        <ul className="item-list">
                            {listItems.map((entry) => (
                                <li key={entry.id} className="item-row">
                                    <span className="item-bullet" />
                                    <div className="item-main">
                                        <strong>{entry.name}</strong>
                                        <span className="item-meta">Origen: {entry.source}</span>
                                    </div>
                                    {renderQuantityControls(entry)}
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => moveToBasket(entry.id)}
                                        disabled={savingItemId === entry.id}
                                    >
                                        {savingItemId === entry.id ? "Moviendo..." : "Pasar a cesta"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-state">No hay productos en la lista por ahora.</p>
                    )}
                </section>

                <section className="panel list-panel list-panel--basket">
                    <div className="section-header">
                        <div>
                            <h3>En la cesta</h3>
                            <p className="section-subtitle">Lo que ya has cogido</p>
                        </div>
                        <div className="basket-actions">
                            <span className="count-pill">{basketItems.length}</span>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={finalizePurchase}
                                disabled={!basketItems.length || finalizing}
                            >
                                {finalizing ? "Finalizando..." : "Finalizar compra"}
                            </button>
                        </div>
                    </div>

                    {basketItems.length ? (
                        <ul className="item-list">
                            {basketItems.map((entry) => (
                                <li key={entry.id} className="item-row item-row--basket">
                                    <span className="item-bullet item-bullet--basket" />
                                    <div className="item-main">
                                        <strong>{entry.name}</strong>
                                        <span className="item-meta">x{entry.quantity}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => restoreToList(entry.id)}
                                        disabled={savingItemId === entry.id}
                                    >
                                        {savingItemId === entry.id ? "Volviendo..." : "Volver a lista"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-state">La cesta está vacía.</p>
                    )}
                </section>
            </div>

            {error && <p className="error-text">{error}</p>}
        </section>
    );
}

export default ListPage;
