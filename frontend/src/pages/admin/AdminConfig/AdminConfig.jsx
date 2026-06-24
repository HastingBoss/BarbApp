import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import "./AdminConfig.css";

export default function AdminConfig() {
  const { sendRequest: fetchConfig, response: configResponse, loading: loadingConfig } = useRequest();
  const { sendRequest: updateConfig, loading: updatingConfig, error: updateError } = useRequest();
  
  const [porcentajeSalon, setPorcentajeSalon] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchConfig(() => api.get("/config").then((data) => {
      if (data && data.porcentajeSalon !== undefined) {
        setPorcentajeSalon(data.porcentajeSalon);
      }
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("");
    updateConfig(async () => {
      await api.put("/config", { porcentajeSalon });
      setSuccessMsg("Configuración guardada exitosamente");
      setTimeout(() => setSuccessMsg(""), 3000);
    });
  };

  return (
    <div className="config-container">
      <div className="config-header">
        <h1>Configuración del <span>Salón</span></h1>
      </div>

      <div className="config-card">
        <form onSubmit={handleSubmit}>
          {updateError && (
            <div className="login-error" style={{ marginBottom: "16px" }}>
              Error: {updateError}
            </div>
          )}
          {successMsg && (
            <div className="success-toast" style={{ marginBottom: "16px" }}>
              {successMsg}
            </div>
          )}

          <div className="login-form-group">
            <label htmlFor="porcentajeSalon">Porcentaje de recargo del salón (%)</label>
            <p className="field-helper-text">
              Este porcentaje se sumará automáticamente al precio base de todos los servicios ofrecidos por los barberos, a menos que se defina un precio personalizado.
            </p>
            <input
              id="porcentajeSalon"
              type="number"
              min="0"
              max="200"
              required
              value={porcentajeSalon}
              onChange={(e) => setPorcentajeSalon(Number(e.target.value))}
              placeholder="Ej. 10"
              className="login-input"
              disabled={loadingConfig || updatingConfig}
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={loadingConfig || updatingConfig}
            style={{ marginTop: "16px" }}
          >
            {updatingConfig ? "Guardando..." : "Guardar Configuración"}
          </button>
        </form>
      </div>
    </div>
  );
}
