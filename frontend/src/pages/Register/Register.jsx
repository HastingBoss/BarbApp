import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import useRequest from "../../hooks/useRequest";
import { api } from "../../utils/api";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const { sendRequest, loading, response, error } = useRequest();
  const [registeredEmail, setRegisteredEmail] = useState("");

  const { values, handleChange } = useForm({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sendRequest(() => api.post("/auth/register", values));
  };

  useEffect(() => {
    if (response) {
      setRegisteredEmail(values.email);
    }
  }, [response]);

  if (registeredEmail) {
    return (
      <div className="register-container">
        <div className="register-card">
          <h2 className="register-title">CUENTA CREADA</h2>
          <p className="register-subtitle" style={{ margin: "20px 0", fontSize: "15px", lineHeight: "1.6" }}>
            Te enviamos un email de confirmación a <strong>{registeredEmail}</strong>.<br />
            Verificá tu casilla para activar tu cuenta.
          </p>
          <button 
            type="button" 
            className="register-submit-btn" 
            onClick={() => navigate("/login")}
          >
            Ya verifiqué mi email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">CREAR CUENTA</h2>
        <p className="register-subtitle">Registrate para comenzar a reservar turnos</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-form-group">
            <label htmlFor="reg-name">Nombre Completo</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              required
              value={values.name}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className="register-input"
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="reg-email">Correo Electrónico</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              required
              value={values.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="register-input"
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              required
              value={values.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="register-input"
            />
          </div>

          {error && <div className="register-error">{error}</div>}

          <button type="submit" disabled={loading} className="register-submit-btn">
            {loading ? <div className="loading-spinner"></div> : "Registrarse"}
          </button>
        </form>

        <p className="register-footer-text">
          ¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión acá</Link>
        </p>
      </div>
    </div>
  );
}
