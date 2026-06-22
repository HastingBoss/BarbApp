import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import { useForm } from "../../../hooks/useForm";
import "./AdminConfig.css";

export default function AdminConfig() {
  const configRequest = useRequest();
  const actionRequest = useRequest();
  const [successMsg, setSuccessMsg] = useState("");

  const { values, setValues, handleChange } = useForm({
    horaRecordatorio: "09:00",
  });

  useEffect(() => {
    configRequest.sendRequest(() =>
      api.get("/config").then((data) => {
        if (data) {
          setValues({
            horaRecordatorio: data.horaRecordatorio,
          });
        }
      })
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("");
    actionRequest.sendRequest(async () => {
      await api.put("/config", {
        horaRecordatorio: values.horaRecordatorio,
      });
      setSuccessMsg("¡Configuración guardada con éxito!");
      setTimeout(() => setSuccessMsg(""), 4000);
    });
  };

  return (
    <div className="config-container">
      <div className="config-header">
        <h1>Configuración del <span>Sistema</span></h1>
      </div>

      {successMsg && (
        <div className="config-success-alert">
          {successMsg}
        </div>
      )}

      {actionRequest.error && (
        <div className="login-error">
          Error: {actionRequest.error}
        </div>
      )}

      {configRequest.loading ? (
        <div className="empty-text">
          <div className="loading-spinner"></div>
          <p className="config-loading-text">Cargando parámetros...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="config-form">


          <div className="config-form-group">
            <label htmlFor="cfg-hora">Hora de Envío de Recordatorio Diario</label>
            <input
              id="cfg-hora"
              type="time"
              name="horaRecordatorio"
              required
              value={values.horaRecordatorio}
              onChange={handleChange}
              className="config-input"
            />
            <p className="config-help-text">
              Hora en la cual el sistema envía el email recordatorio para turnos de ese mismo día.
            </p>
          </div>

          <button type="submit" disabled={actionRequest.loading} className="config-save-btn">
            {actionRequest.loading ? "Guardando..." : "Guardar Configuración"}
          </button>
        </form>
      )}
    </div>
  );
}
