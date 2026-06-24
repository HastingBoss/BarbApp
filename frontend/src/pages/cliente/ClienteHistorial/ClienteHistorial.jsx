import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import "./ClienteHistorial.css";

export default function ClienteHistorial() {
  const { user } = useAuth();
  const turnosRequest = useRequest();
  const actionRequest = useRequest();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });


  const loadTurnos = () => {
    if (user && user._id) {
      turnosRequest.sendRequest(() => api.get(`/turnos/cliente/${user._id}`));
    }
  };

  useEffect(() => {
    loadTurnos();
  }, [user]);

  const handleCancelar = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancelar Turno",
      message: "¿Seguro de que querés cancelar este turno?",
      onConfirm: () => {
        actionRequest.sendRequest(async () => {
          await api.delete(`/turnos/${id}`);
          loadTurnos();
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const getFormattedDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const turnos = turnosRequest.response || [];


  return (
    <div>
      <div className="historial-header">
        <h1>Mi Historial de <span>Turnos</span></h1>
      </div>



      {actionRequest.error && (
        <div className="login-error historial-error">
          Error al cancelar: {actionRequest.error}
        </div>
      )}

      {turnosRequest.loading ? (
        <div className="empty-text">
          <div className="loading-spinner"></div>
          <p className="historial-loading-text">Cargando tus turnos...</p>
        </div>
      ) : (
        <div className="historial-table-container">
          {turnos.length === 0 ? (
            <p className="empty-text">
              Aún no realizaste ninguna reserva.
            </p>
          ) : (
            <table className="historial-table">
              <thead>
                <tr>
                  <th className="historial-th">Fecha</th>
                  <th className="historial-th">Hora</th>
                  <th className="historial-th">Barbero</th>
                  <th className="historial-th">Servicio</th>
                  <th className="historial-th">Estado</th>
                  <th className="historial-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnos
                  .slice()
                  .sort((a, b) => new Date(b.fecha + "T" + b.horaInicio) - new Date(a.fecha + "T" + a.horaInicio))
                  .map((t) => (
                    <tr key={t._id} className="historial-tr">
                      <td className="historial-td" data-label="Fecha">{getFormattedDate(t.fecha)}</td>
                      <td className="historial-td" data-label="Hora"><strong>{t.horaInicio}</strong></td>
                      <td className="historial-td" data-label="Barbero">{t.barbero?.user?.name || "Sin nombre"}</td>
                      <td className="historial-td" data-label="Servicio">{t.barberoServicio?.servicio?.nombre || "Sin servicio"}</td>

                      <td className="historial-td" data-label="Estado">
                        <span className={`dashboard-badge dashboard-badge-${t.estado}`}>
                          {t.estado === "pendiente" && "Pendiente"}
                          {t.estado === "cancelado" && "Cancelado"}
                          {t.estado === "completado" && "Completado"}
                        </span>
                      </td>
                      <td className="historial-td" data-label="Acciones">
                        {t.estado === "pendiente" && (
                          <button
                            onClick={() => handleCancelar(t._id)}
                            className="btn btn-danger btn-sm"
                            disabled={actionRequest.loading}
                          >
                            Cancelar Turno
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
