import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

function ListPage() {
    const [item, setItem] = useState("");
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function loadItems() {
            try {
                setError("");
                const data = await apiRequest("/list");
                if (mounted) {
                    setItems(data.items || []);
                }
            } catch (requestError) {
                if (mounted) {
                    setError(requestError.message);
                }
            }
        }

        loadItems();

        return () => {
            mounted = false;
        };
    }, []);

    function addItem(event) {
        event.preventDefault();
        if (!item.trim()) {
            return;
        }
        setItems((prev) => [...prev, { id: crypto.randomUUID(), name: item.trim() }]);
        setItem("");
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
