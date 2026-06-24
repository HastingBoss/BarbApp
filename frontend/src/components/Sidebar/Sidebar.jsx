import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

export default function Sidebar() {
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
        <div className="sidebar-overlay" onClick={closeMenu}></div>
      )}
      <aside className={`admin-sidebar ${menuOpen ? "menu-open" : ""}`}>
        <div className="sidebar-brand">
          💈 BARBERÍA<span>PREMIUM</span>
        </div>
        {user && (
          <button className="sidebar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
        <div className={`sidebar-menu ${menuOpen ? "open" : ""}`}>
          <NavLink to="/admin" end onClick={closeMenu} className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}>
            Resumen
          </NavLink>
          <NavLink to="/admin/barberos" onClick={closeMenu} className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}>
            Barberos
          </NavLink>
          <NavLink to="/admin/servicios" onClick={closeMenu} className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}>
            Servicios
          </NavLink>
          <NavLink to="/admin/turnos" onClick={closeMenu} className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}>
            Turnos
          </NavLink>

          {user && (
            <div className="sidebar-user">
              <span className="sidebar-user-text">
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} className="sidebar-logout-btn">
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
