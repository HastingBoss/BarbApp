import { useEffect } from "react";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const turnosRequest = useRequest();
  const barberosRequest = useRequest();

  useEffect(() => {
    turnosRequest.sendRequest(() => api.get("/turnos"));
    barberosRequest.sendRequest(() => api.get("/barberos"));
  }, []);

  const turnos = turnosRequest.response || [];
  const barberos = barberosRequest.response || [];

  const getTodayString = () => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getFormattedDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const todayStr = getTodayString();

  const turnosHoy = turnos.filter((t) => {
    if (!t.fecha) return false;
    const tFechaStr = t.fecha.split("T")[0];
    return tFechaStr === todayStr;
  });

  const barberosActivos = barberos.filter((b) => b.active);

  const ingresosDelMes = turnos.reduce((total, t) => {
    if (t.estado === "completado" && t.fecha) {
      const d = new Date(t.fecha);
      const hoy = new Date();
      if (d.getUTCFullYear() === hoy.getFullYear() && d.getUTCMonth() === hoy.getMonth()) {
        const precio = t.servicio?.precio || 0;
        total += precio;
      }
    }
    return total;
  }, 0);

  const isLoading = turnosRequest.loading || barberosRequest.loading;
  const isError = turnosRequest.error || barberosRequest.error;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Panel de <span>Control</span></h1>
      </div>

      {isLoading ? (
        <div className="dashboard-loading-wrapper">
          <div className="loading-spinner"></div>
          <p className="dashboard-loading-text">Cargando resumen...</p>
        </div>
      ) : isError ? (
        <div className="login-error dashboard-error-wrapper">
          Error al cargar datos: {isError}
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="summary-card">
              <span className="card-title">Turnos de Hoy</span>
              <span className="card-value">{turnosHoy.length}</span>
            </div>
            <div className="summary-card">
              <span className="card-title">Barberos Activos</span>
              <span className="card-value">{barberosActivos.length}</span>
            </div>
            <div className="summary-card">
              <span className="card-title">Ingresos del Mes</span>
              <span className="card-value">${ingresosDelMes.toLocaleString("es-AR")}</span>
            </div>
          </div>

          <h2 className="section-title">Turnos de Hoy ({getFormattedDate(todayStr)})</h2>
          <div className="table-container">
            {turnosHoy.length === 0 ? (
              <p className="empty-text">
                No hay turnos programados para hoy.
              </p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th className="dashboard-th">Hora</th>
                    <th className="dashboard-th">Cliente</th>
                    <th className="dashboard-th">Barbero</th>
                    <th className="dashboard-th">Servicio</th>
                    <th className="dashboard-th">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {turnosHoy.map((t) => {
                    const clienteNombre = t.cliente ? (t.cliente.name || t.cliente.nombre) : "Invitado";
                    return (
                      <tr key={t._id} className="dashboard-tr">
                        <td className="dashboard-td"><strong>{t.horaInicio}</strong></td>
                        <td className="dashboard-td">{clienteNombre}</td>
                        <td className="dashboard-td">{t.barbero?.user?.name || "Sin Nombre"}</td>
                        <td className="dashboard-td">{t.servicio?.nombre || "Sin Servicio"}</td>
                        <td className="dashboard-td">
                          <span className={`dashboard-badge dashboard-badge-${t.estado}`}>{t.estado}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
