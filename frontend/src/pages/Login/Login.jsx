import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "../../hooks/useForm";
import useRequest from "../../hooks/useRequest";
import { api } from "../../utils/api";
import "./Login.css";

export default function Login() {
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

  const handleGuestClick = () => {
    navigate("/reservar");
  };

  useEffect(() => {
    if (response) {
      login(response).then((user) => {
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "barbero") {
          navigate("/barbero");
        } else {
          navigate("/cliente/reserva");
        }
      });
    }
  }, [response, login, navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Acceso para Clientes</h2>
        <p className="login-subtitle">Iniciá sesión para gestionar tus turnos</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="login-email">Correo Electrónico</label>
            <input
              id="login-email"
              type="email"
              name="email"
              required
              value={values.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="login-input"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              name="password"
              required
              value={values.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="login-input"
            />
          </div>

          {error && (
            <div className="login-error">
              {error === "Verificá tu email antes de iniciar sesión" 
                ? "Verificá tu email antes de iniciar sesión. Revisá tu casilla de correo." 
                : error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? <div className="loading-spinner"></div> : "Iniciar Sesión"}
          </button>
        </form>

        <button 
          onClick={handleGuestClick} 
          type="button" 
          className="btn btn-secondary login-guest-btn"
        >
          Reservar sin cuenta →
        </button>

        <p className="login-footer-text">
          ¿No tenés una cuenta? <Link to="/register">Registrate acá</Link>
        </p>
        <p className="login-footer-text" style={{ marginTop: "12px" }}>
          ¿Sos del equipo? <Link to="/staff">Accedé acá</Link>
        </p>
      </div>


    </div>
  );
}
