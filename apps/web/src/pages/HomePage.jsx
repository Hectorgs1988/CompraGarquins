import { Link } from "react-router-dom";

function HomePage() {
    return (
        <section className="card-grid">
            <article className="panel">
                <h2>Lista inteligente</h2>
                <p>
                    Anade articulos manualmente o desde tags NFC que abren enlaces NDEF de
                    la app.
                </p>
                <Link to="/lista" className="btn">
                    Ir a la lista
                </Link>
            </article>

            <article className="panel">
                <h2>Recetas</h2>
                <p>Guarda y organiza tus recetas para reutilizar ingredientes.</p>
                <Link to="/recetas" className="btn">
                    Ver recetas
                </Link>
            </article>
        </section>
    );
}

export default HomePage;
