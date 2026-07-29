import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

function NfcPage() {
    const { slug } = useParams();
    const [tag, setTag] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [consumed, setConsumed] = useState(null);
    const [consuming, setConsuming] = useState(false);
    const [consumeError, setConsumeError] = useState("");

    const decoded = useMemo(() => {
        try {
            return decodeURIComponent(slug || "");
        } catch {
            return slug || "";
        }
    }, [slug]);

    useEffect(() => {
        let mounted = true;

        async function loadTag() {
            try {
                setLoadError("");
                const data = await apiRequest(`/nfc/${decoded}`);
                if (mounted) {
                    setTag(data.tag);
                }
            } catch (error) {
                if (mounted) {
                    setLoadError(error.message);
                }
            }
        }

        if (decoded) {
            loadTag();
        }

        return () => {
            mounted = false;
        };
    }, [decoded]);

    async function handleConsume() {
        try {
            setConsumeError("");
            setConsuming(true);
            const data = await apiRequest(`/nfc/${decoded}/consume`, {
                method: "POST"
            });
            setConsumed(data.item);
            window.dispatchEvent(new CustomEvent("cesta:list-updated", {
                detail: data.item
            }));
        } catch (error) {
            if (error.status === 401) {
                setConsumeError("Necesitas iniciar sesion para consumir la etiqueta.");
            } else {
                setConsumeError(error.message);
            }
        } finally {
            setConsuming(false);
        }
    }

    return (
        <section className="panel">
            <h2>Entrada NFC detectada</h2>

            {!loadError && (
                <p>
                    Token NFC detectado: <strong>{decoded}</strong>
                </p>
            )}

            {tag && (
                <p>
                    Esta etiqueta esta asociada a <strong>{tag.itemName}</strong> x
                    {tag.quantity}.
                </p>
            )}

            {loadError && <p className="error-text">{loadError}</p>}

            {tag && (
                <button type="button" onClick={handleConsume} disabled={consuming}>
                    {consuming ? "Consumiendo..." : "Anadir a la lista"}
                </button>
            )}

            {consumeError && <p className="error-text">{consumeError}</p>}

            {consumed && (
                <p className="success-text">
                    Anadido: {consumed.name} x{consumed.quantity}
                </p>
            )}

            <Link to="/lista" className="btn">
                Ir a la lista
            </Link>
        </section>
    );
}

export default NfcPage;
