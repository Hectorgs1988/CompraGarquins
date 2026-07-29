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
                    <h1>CestaGarquins</h1>
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
                    Inicio
                </NavLink>
                <NavLink to="/lista" className={({ isActive }) => (isActive ? "active" : "") }>
                    Lista
                </NavLink>
                <NavLink to="/recetas" className={({ isActive }) => (isActive ? "active" : "") }>
                    Recetas
                </NavLink>
            </nav>
        </div>
    );
}

export default App;
