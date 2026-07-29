import { Link } from "react-router-dom";

function HomePage() {
    return (
        <section className="card-grid card-grid--home">
            <article className="panel panel--home-hero">
                <div>
                    <p className="eyebrow">Compra rápida</p>
                    <h2>Todo preparado para usar desde el móvil</h2>
                    <p>
                        Añade productos, pasa los que coges a la cesta y finaliza la compra en un toque.
                    </p>
                </div>
                <Link to="/lista" className="btn btn--wide">
                    Abrir lista
                </Link>
            </article>

            <article className="panel">
                <h3>NFC</h3>
                <p>
                    Escanea tags NFC para añadir productos directamente a la lista sin escribir.
                </p>
                <Link to="/lista" className="btn btn--secondary">
                    Ir a NFC
                </Link>
            </article>

            <article className="panel">
                <h3>Recetas</h3>
                <p>Guarda y organiza tus recetas para reutilizar ingredientes.</p>
                <Link to="/recetas" className="btn btn--secondary">
                    Ver recetas
                </Link>
            </article>
        </section>
    );
}

export default HomePage;
