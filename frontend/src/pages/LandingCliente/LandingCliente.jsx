import { Link, useNavigate } from "react-router-dom";
import "./LandingCliente.css";

export default function LandingCliente() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1 className="landing-title">💈 BARBERÍA<span>PREMIUM</span></h1>
        <p className="landing-subtitle">El estilo y la distinción que te merecés</p>

        <div className="landing-actions">
          <button onClick={() => navigate("/reservar")} className="btn landing-btn">
            Reservar Turno
          </button>
          <button onClick={() => navigate("/login")} className="btn btn-secondary landing-btn">
            Iniciar Sesión
          </button>
        </div>

        <div className="landing-staff-link">
          ¿Sos del equipo? <Link to="/staff" className="staff-link">Accedé acá</Link>
        </div>
      </div>
    </div>
  );
}
