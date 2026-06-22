import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useRequest from "../../hooks/useRequest";
import { api } from "../../utils/api";
import "./VerifyEmail.css";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { sendRequest, loading, response, error } = useRequest();

  useEffect(() => {
    if (token) {
      sendRequest(() => api.get(`/auth/verify-email?token=${token}`));
    }
  }, [token]);

  return (
    <div className="verify-container">
      <div className="verify-card">
        {!token ? (
          <div>
            <h2 className="verify-title verify-title-error">❌ Token no válido</h2>
            <p className="verify-text">El enlace de verificación no contiene un token válido.</p>
            <button className="btn verify-btn" onClick={() => navigate("/login")}>
              Volver al inicio
            </button>
          </div>
        ) : loading ? (
          <div>
            <div className="loading-spinner verify-spinner"></div>
            <p className="verify-text">Verificando tu email...</p>
          </div>
        ) : error ? (
          <div>
            <h2 className="verify-title verify-title-error">❌ El enlace es inválido o ya expiró</h2>
            <p className="verify-text">Ocurrió un error al verificar tu cuenta. Asegúrate de usar el enlace más reciente.</p>
            <button className="btn verify-btn" onClick={() => navigate("/login")}>
              Volver al inicio
            </button>
          </div>
        ) : (
          <div>
            <h2 className="verify-title verify-title-success">✅ ¡Email verificado correctamente!</h2>
            <p className="verify-text">Tu cuenta ha sido activada. Ya podés iniciar sesión.</p>
            <button className="btn verify-btn" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
