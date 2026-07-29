import { useState } from "react";

function ListPage() {
    const [item, setItem] = useState("");
    const [items, setItems] = useState([]);

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
                    <li key={entry.id}>{entry.name}</li>
                ))}
            </ul>
        </section>
    );
}

export default ListPage;
