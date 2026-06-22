import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "../../hooks/useForm";
import useRequest from "../../hooks/useRequest";
import { api } from "../../utils/api";
import "./StaffLogin.css";

export default function StaffLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { sendRequest, loading, response, error } = useRequest();

  const { values, handleChange } = useForm({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sendRequest(() => api.post("/auth/login", values));
  };

  useEffect(() => {
    if (response) {
      login(response).then((user) => {
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "barbero") {
          navigate("/barbero");
        } else {
          // Si por alguna razón ingresa un cliente, redirigir a inicio
          navigate("/");
        }
      });
    }
  }, [response, login, navigate]);

  return (
    <div className="staff-login-container">
      <div className="staff-login-card">
        <span className="staff-badge">Equipo</span>
        <h2 className="staff-login-title">BARBERÍA PREMIUM</h2>
        <p className="staff-login-subtitle">Acceso exclusivo para el equipo</p>

        <form onSubmit={handleSubmit} className="staff-login-form">
          <div className="staff-login-form-group">
            <label htmlFor="staff-email">Correo Electrónico</label>
            <input
              id="staff-email"
              type="email"
              name="email"
              required
              value={values.email}
              onChange={handleChange}
              placeholder="nombre@barberiapremium.com"
              className="staff-login-input"
            />
          </div>

          <div className="staff-login-form-group">
            <label htmlFor="staff-password">Contraseña</label>
            <input
              id="staff-password"
              type="password"
              name="password"
              required
              value={values.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="staff-login-input"
            />
          </div>

          {error && <div className="staff-login-error">{error}</div>}

          <button type="submit" disabled={loading} className="staff-login-submit-btn">
            {loading ? <div className="loading-spinner"></div> : "Ingresar al Panel"}
          </button>
        </form>

        <button 
          onClick={() => navigate("/")} 
          type="button" 
          className="btn btn-secondary staff-back-btn"
        >
          ← Volver al sitio de clientes
        </button>
      </div>
    </div>
  );
}
