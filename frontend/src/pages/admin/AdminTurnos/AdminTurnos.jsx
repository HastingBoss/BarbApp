import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import "./AdminTurnos.css";

export default function AdminTurnos() {
  const { sendRequest: fetchTurnos, response: turnosResponse, loading: loadingTurnos } = useRequest();
  const { sendRequest: completarTurno, loading: completandoTurno, error: completarError } = useRequest();
  const { sendRequest: cancelarTurno, loading: cancelandoTurno, error: cancelarError } = useRequest();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const loadTurnos = () => {
    fetchTurnos(() => api.get("/turnos"));
  };

  useEffect(() => {
    loadTurnos();
  }, []);

  const handleCompletar = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Completar Turno",
      message: "¿Marcar este turno como completado?",
      onConfirm: () => {
        completarTurno(async () => {
          await api.patch(`/turnos/${id}/completar`);
          loadTurnos();
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleCancelar = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancelar Turno",
      message: "¿Seguro de que querés cancelar este turno?",
      onConfirm: () => {
        cancelarTurno(async () => {
          await api.delete(`/turnos/${id}`);
          loadTurnos();
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const turnos = turnosResponse || [];
  const currentError = completarError || cancelarError;

  const getFormattedDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <div className="turnos-header">
        <h1>Gestión de <span>Turnos</span></h1>
      </div>

      {currentError && (
        <div className="login-error">
          Error: {currentError}
        </div>
      )}

      {loadingTurnos ? (
        <div className="empty-text">
          <div className="loading-spinner"></div>
          <p className="turnos-loading-text">Cargando turnos...</p>
        </div>
      ) : (
        <div className="turnos-table-container">
          {turnos.length === 0 ? (
            <p className="empty-text">
              No hay turnos registrados en el sistema.
            </p>
          ) : (
            <table className="turnos-table">
              <thead>
                <tr>
                  <th className="turnos-th">Fecha</th>
                  <th className="turnos-th">Hora</th>
                  <th className="turnos-th">Cliente</th>
                  <th className="turnos-th">Barbero</th>
                  <th className="turnos-th">Servicio</th>
                  <th className="turnos-th">Estado</th>
                  <th className="turnos-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnos
                  .slice()
                  .sort((a, b) => new Date(b.fecha + "T" + b.horaInicio) - new Date(a.fecha + "T" + a.horaInicio))
                  .map((t) => {
                    const clienteNombre = t.cliente ? (t.cliente.name || t.cliente.nombre) : "Invitado";
                    return (
                      <tr key={t._id} className="turnos-tr">
                        <td className="turnos-td" data-label="Fecha">{getFormattedDate(t.fecha)}</td>
                        <td className="turnos-td" data-label="Hora"><strong>{t.horaInicio}</strong></td>
                        <td className="turnos-td" data-label="Cliente">{clienteNombre}</td>
                        <td className="turnos-td" data-label="Barbero">{t.barbero?.user?.name || "Sin nombre"}</td>
                        <td className="turnos-td" data-label="Servicio">{t.servicio?.nombre || "Sin servicio"}</td>
                        <td className="turnos-td" data-label="Estado">
                          <span className={`dashboard-badge dashboard-badge-${t.estado}`}>{t.estado}</span>
                        </td>
                        <td className="turnos-td" data-label="Acciones">
                          {t.estado === "pendiente" && (
                            <div className="actions-cell">
                              <button
                                onClick={() => handleCompletar(t._id)}
                                className="btn btn-sm"
                                disabled={completandoTurno}
                              >
                                Completar
                              </button>
                              <button
                                onClick={() => handleCancelar(t._id)}
                                className="btn btn-danger btn-sm"
                                disabled={cancelandoTurno}
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
