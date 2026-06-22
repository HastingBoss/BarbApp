import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./BarberoNav.css";

export default function BarberoNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {user && menuOpen && (
        <div className="barberonav-overlay" onClick={closeMenu}></div>
      )}
      <aside className={`barbero-sidebar ${menuOpen ? "menu-open" : ""}`}>
        <div className="barberonav-brand">
          💈 BARBERÍA<span>PREMIUM</span>
        </div>
        {user && (
          <button className="barberonav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
        <div className={`barberonav-menu ${menuOpen ? "open" : ""}`}>
          <NavLink to="/barbero" end onClick={closeMenu} className={({ isActive }) => `barberonav-item ${isActive ? "active" : ""}`}>
            Mi Agenda
          </NavLink>
          {user && (
            <div className="barberonav-user">
              <span className="barberonav-user-text">
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} className="barberonav-logout-btn">
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
