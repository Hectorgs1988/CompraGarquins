import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

function ListPage() {
    const [item, setItem] = useState("");
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");

    async function loadItems() {
        try {
            setError("");
            const data = await apiRequest("/list");
            setItems(data.items || []);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

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
        const nextItem = item.trim();
        if (!nextItem) {
            return;
        }

        try {
            setError("");
            await apiRequest("/list", {
                method: "POST",
                body: JSON.stringify({ name: nextItem, quantity: 1 })
            });
            setItem("");
            await loadItems();
            window.dispatchEvent(new CustomEvent("cesta:list-updated"));
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <section className="panel">
            <h2>Lista de la compra</h2>

            <form className="inline-form" onSubmit={addItem}>
                <input
                    value={item}
                    onChange={(event) => setItem(event.target.value)}
                    placeholder="Ej. Leche"
                />
                <button type="submit">Anadir</button>
            </form>

            <ul className="simple-list">
                {items.map((entry) => (
                    <li key={entry.id}>
                        {entry.name} {entry.quantity ? `x${entry.quantity}` : ""}
                    </li>
                ))}
            </ul>

            {error && <p className="error-text">{error}</p>}
        </section>
    );
}

export default ListPage;
