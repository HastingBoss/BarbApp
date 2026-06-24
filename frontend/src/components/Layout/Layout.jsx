import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const renderNavLinks = () => {
    if (!user) return null;

    const closeMenu = () => setMenuOpen(false);

    if (user.role === "admin") {
      return (
        <>
          <NavLink to="/admin" end onClick={closeMenu} className={({ isActive }) => `navbar-item ${isActive ? "active" : ""}`}>
            Resumen
          </NavLink>
          <NavLink to="/admin/barberos" onClick={closeMenu} className={({ isActive }) => `navbar-item ${isActive ? "active" : ""}`}>
            Barberos
          </NavLink>
          <NavLink to="/admin/servicios" onClick={closeMenu} className={({ isActive }) => `navbar-item ${isActive ? "active" : ""}`}>
            Servicios
          </NavLink>
          <NavLink to="/admin/turnos" onClick={closeMenu} className={({ isActive }) => `navbar-item ${isActive ? "active" : ""}`}>
            Turnos
          </NavLink>

        </>
      );
    }

    if (user.role === "barbero") {
      return (
        <NavLink to="/barbero" end onClick={closeMenu} className={({ isActive }) => `navbar-item ${isActive ? "active" : ""}`}>
          Mi Agenda
        </NavLink>
      );
    }

    if (user.role === "cliente") {
      return (
        <>
          <NavLink to="/cliente/reserva" onClick={closeMenu} className={({ isActive }) => `navbar-item ${isActive ? "active" : ""}`}>
            Nueva Reserva
          </NavLink>
          <NavLink to="/cliente/historial" onClick={closeMenu} className={({ isActive }) => `navbar-item ${isActive ? "active" : ""}`}>
            Mis Turnos
          </NavLink>
        </>
      );
    }

    return null;
  };

  return (
    <div className={`app-layout ${menuOpen ? "menu-open" : ""}`}>
      {user && menuOpen && (
        <div className="navbar-overlay" onClick={() => setMenuOpen(false)}></div>
      )}

      <nav className="navbar">
        <div className="navbar-brand">
          💈 BARBERÍA<span>PREMIUM</span>
        </div>
        {user && (
          <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
        <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          {renderNavLinks()}
          {user && (
            <div className="navbar-user">
              <span className="navbar-user-text">
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} className="navbar-logout-btn">
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className="main-content">{children || <Outlet />}</main>
    </div>
  );
}

