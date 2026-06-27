import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./AdminTurnos.css";

const BARBER_COLORS = [
  "#3498db", // Blue
  "#2ecc71", // Green
  "#9b59b6", // Purple
  "#e67e22", // Orange
  "#e74c3c", // Red
  "#1abc9c", // Teal
  "#f1c40f", // Yellow
  "#34495e", // Dark grey
];

export default function AdminTurnos() {
  const [viewMode, setViewMode] = useState("table");

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

  const barberColorMap = {};
  let colorIndex = 0;

  const events = turnos.map((t) => {
    if (!t.fecha || !t.horaInicio) return null;
    const dStr = t.fecha.split("T")[0];
    const startStr = `${dStr}T${t.horaInicio}:00`;
    
    const duracion = t.barberoServicio?.duracion || t.barberoServicio?.servicio?.duracion || 30;
    const [h, m] = t.horaInicio.split(":").map(Number);
    const totalMinutes = h * 60 + m + duracion;
    const endH = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const endM = String(totalMinutes % 60).padStart(2, "0");
    const endStr = `${dStr}T${endH}:${endM}:00`;

    const clienteNombre = t.cliente ? (t.cliente.name || t.cliente.nombre) : "Invitado";
    const barberoNombre = t.barbero?.user?.name || "Barbero";
    const barberoId = t.barbero?._id;

    let color = "#7f8c8d";
    if (t.estado === "cancelado") {
      color = "#e74c3c";
    } else if (barberoId) {
      if (!barberColorMap[barberoId]) {
        barberColorMap[barberoId] = BARBER_COLORS[colorIndex % BARBER_COLORS.length];
        colorIndex++;
      }
      color = barberColorMap[barberoId];
    }

    return {
      id: t._id,
      title: `${barberoNombre}: ${clienteNombre} - ${t.barberoServicio?.servicio?.nombre || "Servicio"}`,
      start: startStr,
      end: endStr,
      backgroundColor: color,
      borderColor: color,
      textColor: "#ffffff",
      extendedProps: {
        estado: t.estado,
        cliente: clienteNombre,
        barbero: barberoNombre,
        servicio: t.barberoServicio?.servicio?.nombre || "Sin servicio",
        telefono: t.cliente?.telefono || "",
        email: t.cliente?.email || "",
      }
    };
  }).filter(Boolean);

  const getFormattedDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <div className="turnos-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Gestión de <span>Turnos</span></h1>
        <div className="view-mode-toggles" style={{ display: "flex", gap: "5px", background: "var(--color-border)", padding: "4px", borderRadius: "var(--radius)" }}>
          <button
            onClick={() => setViewMode("table")}
            className={`btn btn-sm ${viewMode === "table" ? "" : "btn-secondary"}`}
            style={{ margin: 0, padding: "6px 12px", width: "auto" }}
          >
            Tabla
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`btn btn-sm ${viewMode === "calendar" ? "" : "btn-secondary"}`}
            style={{ margin: 0, padding: "6px 12px", width: "auto" }}
          >
            Calendario
          </button>
        </div>
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
      ) : viewMode === "table" ? (
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
                        <td className="turnos-td" data-label="Servicio">{t.barberoServicio?.servicio?.nombre || t.servicio?.nombre || "Sin servicio"}</td>
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
      ) : (
        <div className="calendar-view-container" style={{ backgroundColor: "var(--color-surface)", padding: "20px", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow)" }}>
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridWeek,timeGridDay"
            }}
            locale="es"
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              list: 'Agenda'
            }}
            slotMinTime="09:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            slotDuration="00:30:00"
            events={events}
            eventClick={(info) => {
              const props = info.event.extendedProps;
              setConfirmModal({
                isOpen: true,
                title: `Detalles del Turno - ${props.estado.toUpperCase()}`,
                message: `Barbero: ${props.barbero}\nCliente: ${props.cliente}\nServicio: ${props.servicio}\nHora: ${info.event.start.toLocaleTimeString("es-AR", {hour: '2-digit', minute:'2-digit'})}\nEmail: ${props.email || "No registrado"}\nTeléfono: ${props.telefono || "No registrado"}`,
                onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false }))
              });
            }}
          />
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
