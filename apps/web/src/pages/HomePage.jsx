import { Link } from "react-router-dom";

function HomePage() {
    return (
        <section className="card-grid card-grid--home">
            <article className="panel panel--home-hero">
                <div>
                    <h2>Lista de la compra</h2>
                    <p>
                        Añade productos, pasa los que coges a la cesta y finaliza la compra en un toque.
                    </p>
                </div>
                <Link to="/lista" className="btn btn--wide">
                    Abrir lista
                </Link>
            </article>

            <article className="panel">
                <h2>Recetas</h2>
                <p>Guarda y organiza tus recetas para reutilizar ingredientes.</p>
                <Link to="/recetas" className="btn btn--secondary btn--wide">
                    Ver recetas
                </Link>
            </article>

            <article className="panel">
                <h2>Pegatinas NFC</h2>
                <p>Configura cada token NFC con un producto para anadirlo con un escaneo.</p>
                <Link to="/nfc-config" className="btn btn--secondary btn--wide">
                    Configurar NFC
                </Link>
            </article>
        </section>
    );
}

export default HomePage;
