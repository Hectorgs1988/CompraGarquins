import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ListPage from "./pages/ListPage";
import RecipesPage from "./pages/RecipesPage";
import NfcPage from "./pages/NfcPage";

function App() {
    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand-block">
                    <h1>Cesta Garquins</h1>
                    <p>Lista inteligente para compra diaria</p>
                </div>
                <nav className="top-nav">
                    <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "") }>
                        Inicio
                    </NavLink>
                    <NavLink to="/lista" className={({ isActive }) => (isActive ? "active" : "") }>
                        Lista
                    </NavLink>
                    <NavLink to="/recetas" className={({ isActive }) => (isActive ? "active" : "") }>
                        Recetas
                    </NavLink>
                </nav>
            </header>

            <main className="app-main">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/lista" element={<ListPage />} />
                    <Route path="/recetas" element={<RecipesPage />} />
                    <Route path="/nfc/:slug" element={<NfcPage />} />
                </Routes>
            </main>

            <nav className="bottom-nav" aria-label="Navegación principal">
                <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "") }>
                    <span className="bottom-nav__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="img">
                            <rect x="4" y="3" width="16" height="18" rx="2" />
                            <line x1="8" y1="8" x2="16" y2="8" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                            <line x1="8" y1="16" x2="14" y2="16" />
                        </svg>
                    </span>
                    <span className="bottom-nav__label">Inicio</span>
                </NavLink>
                <NavLink to="/lista" className={({ isActive }) => (isActive ? "active" : "") }>
                    <span className="bottom-nav__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="img">
                            <circle cx="7" cy="7" r="1.5" />
                            <circle cx="7" cy="12" r="1.5" />
                            <circle cx="7" cy="17" r="1.5" />
                            <line x1="11" y1="7" x2="18" y2="7" />
                            <line x1="11" y1="12" x2="18" y2="12" />
                            <line x1="11" y1="17" x2="18" y2="17" />
                        </svg>
                    </span>
                    <span className="bottom-nav__label">Cesta</span>
                </NavLink>
                <NavLink to="/recetas" className={({ isActive }) => (isActive ? "active" : "") }>
                    <span className="bottom-nav__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="img">
                            <path d="M6 5l4 4" />
                            <path d="M5 6l3-3" />
                            <path d="M10 9l-4 4" />
                            <path d="M14 5l5 5" />
                            <path d="M19 5l-3 3" />
                            <path d="M17 10l-5 5" />
                        </svg>
                    </span>
                    <span className="bottom-nav__label">Recetas</span>
                </NavLink>
            </nav>
        </div>
    );
}

export default App;
