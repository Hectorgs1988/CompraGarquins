import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ListPage from "./pages/ListPage";
import RecipesPage from "./pages/RecipesPage";
import NfcPage from "./pages/NfcPage";

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>CestaGarquins</h1>
        <nav>
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/lista">Lista</NavLink>
          <NavLink to="/recetas">Recetas</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lista" element={<ListPage />} />
          <Route path="/recetas" element={<RecipesPage />} />
          <Route path="/nfc/:slug" element={<NfcPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
