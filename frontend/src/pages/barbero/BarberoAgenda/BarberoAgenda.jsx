import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./BarberoAgenda.css";

export default function BarberoAgenda() {
  const { user } = useAuth();
  const profileRequest = useRequest();
  const turnosRequest = useRequest();
  const actionRequest = useRequest();
  const resumenRequest = useRequest();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [barberoProfile, setBarberoProfile] = useState(null);
  const barberoId = barberoProfile?._id;
  const [showResumen, setShowResumen] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    servicioId: "",
    fecha: "",
    horaInicio: "",
  });
  const [disponibilidadHoras, setDisponibilidadHoras] = useState([]);
  const [modalError, setModalError] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("table");

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

  // 1. Fetch profile
  useEffect(() => {
    profileRequest.sendRequest(() =>
      api.get("/barberos/me/perfil").then((data) => {
        if (data && data._id) {
          setBarberoProfile(data);
        }
      })
    );
  }, []);

  // Fetch disponibilidad para turno manual
  useEffect(() => {
    if (barberoId && manualForm.servicioId && manualForm.fecha) {
      api.get(`/turnos/disponibilidad?barberoId=${barberoId}&servicioId=${manualForm.servicioId}&fecha=${manualForm.fecha}`)
        .then((data) => {
          setDisponibilidadHoras(data.horarios || []);
        })
        .catch((err) => {
          console.error("Error cargando disponibilidad:", err);
          setDisponibilidadHoras([]);
        });
    } else {
      setDisponibilidadHoras([]);
    }
  }, [barberoId, manualForm.servicioId, manualForm.fecha]);

  const handleCreateManualTurno = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError("");

    const body = {
      barberoId,
      barberoServicioId: manualForm.servicioId,
      fecha: manualForm.fecha,
      horaInicio: manualForm.horaInicio,
      nombre: manualForm.nombre,
      email: manualForm.email,
      telefono: manualForm.telefono,
    };

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiBase}/turnos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear el turno");
      }

      setShowManualModal(false);
      setManualForm({
        nombre: "",
        email: "",
        telefono: "",
        servicioId: "",
        fecha: "",
        horaInicio: "",
      });
      loadTurnos();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const loadTurnos = () => {
    if (barberoId) {
      turnosRequest.sendRequest(() => api.get(`/turnos/barbero/${barberoId}`));
    }
  };

  useEffect(() => {
    loadTurnos();
  }, [barberoId]);

  const handleCompletar = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Completar Turno",
      message: "¿Marcar este turno como completado?",
      onConfirm: () => {
        actionRequest.sendRequest(async () => {
          await api.patch(`/turnos/${id}/completar`);
          loadTurnos();
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const toggleResumen = () => {
    if (showResumen) {
      setShowResumen(false);
    } else if (barberoId) {
      resumenRequest.sendRequest(() =>
        api.get(`/turnos/barbero/${barberoId}/resumen-dia?fecha=${todayStr}`).then(() => {
          setShowResumen(true);
        })
      );
    }
  };

  const turnos = turnosRequest.response || [];

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

    let color = "#3498db"; 
    if (t.estado === "completado") color = "#2ecc71"; 
    if (t.estado === "cancelado") color = "#e74c3c"; 

    return {
      id: t._id,
      title: `${clienteNombre} - ${t.barberoServicio?.servicio?.nombre || "Servicio"}`,
      start: startStr,
      end: endStr,
      backgroundColor: color,
      borderColor: color,
      textColor: "#ffffff",
      extendedProps: {
        estado: t.estado,
        cliente: clienteNombre,
        telefono: t.cliente?.telefono || "",
        email: t.cliente?.email || "",
      }
    };
  }).filter(Boolean);

  const turnosHoy = turnos.filter((t) => {
    if (!t.fecha) return false;
    const tFechaStr = t.fecha.split("T")[0];
    return tFechaStr === todayStr && t.estado !== "rejected";
  });

  const isLoading = profileRequest.loading || turnosRequest.loading;
  const isError = profileRequest.error || turnosRequest.error || actionRequest.error;

  return (
    <div>
      <div className="agenda-header">
        <h1>Mi <span>Agenda</span></h1>
        {barberoId && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
            <button onClick={() => setShowManualModal(true)} className="btn">
              Nuevo Turno Manual
            </button>
            <button onClick={toggleResumen} className="btn btn-secondary">
              {showResumen ? " Ocultar Resumen" : "Resumen del Día"}
            </button>
          </div>
        )}
      </div>

      {showResumen && (
        <div className="resumen-panel">
          <h3 className="resumen-panel-title">Resumen Diario de Actividad</h3>
          {resumenRequest.loading ? (
            <div className="agenda-resumen-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : resumenRequest.error ? (
            <p className="login-error">Error al obtener el resumen: {resumenRequest.error}</p>
          ) : (
            <div className="resumen-panel-text">
              {resumenRequest.response?.resumen}
            </div>
          )}
        </div>
      )}

      {isError && (
        <div className="login-error agenda-error">
          Error: {isError}
        </div>
      )}

      {isLoading ? (
        <div className="empty-text">
          <div className="loading-spinner"></div>
          <p className="agenda-loading-text">Cargando agenda...</p>
        </div>
      ) : (
        <>
          {viewMode === "table" ? (
            <>
              <h2 className="agenda-title">
                Turnos de Hoy ({getFormattedDate(todayStr)})
              </h2>

              <div className="agenda-table-container">
                {turnosHoy.length === 0 ? (
                  <p className="empty-text">
                    No tenés turnos programados para el día de hoy.
                  </p>
                ) : (
                  <table className="agenda-table">
                    <thead>
                      <tr>
                        <th className="agenda-th">Hora</th>
                        <th className="agenda-th">Cliente</th>
                        <th className="agenda-th">Servicio</th>
                        <th className="agenda-th">Duración</th>
                        <th className="agenda-th">Estado</th>
                        <th className="agenda-th">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turnosHoy
                        .slice()
                        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                        .map((t) => {
                          const clienteNombre = t.cliente ? (t.cliente.name || t.cliente.nombre) : "Invitado";
                          const duracionEfectiva = t.barberoServicio?.duracion || t.barberoServicio?.servicio?.duracion || 0;
                          return (
                            <tr key={t._id} className="agenda-tr">
                               <td className="agenda-td" data-label="Hora"><strong>{t.horaInicio}</strong></td>
                               <td className="agenda-td" data-label="Cliente">{clienteNombre}</td>
                               <td className="agenda-td" data-label="Servicio">{t.barberoServicio?.servicio?.nombre || "Sin servicio"}</td>
                               <td className="agenda-td" data-label="Duración">{duracionEfectiva} min</td>
                               <td className="agenda-td" data-label="Estado">
                                 <span className={`dashboard-badge dashboard-badge-${t.estado}`}>{t.estado}</span>
                               </td>
                                <td className="agenda-td" data-label="Acciones">
                                  {t.estado === "pendiente" && (
                                    <button
                                      onClick={() => handleCompletar(t._id)}
                                      className="btn btn-sm"
                                      disabled={actionRequest.loading}
                                    >
                                      Completar
                                    </button>
                                  )}
                                </td>
                             </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
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
                    message: `Cliente: ${props.cliente}\nServicio: ${info.event.title.split(" - ")[1] || ""}\nHora: ${info.event.start.toLocaleTimeString("es-AR", {hour: '2-digit', minute:'2-digit'})}\nEmail: ${props.email || "No registrado"}\nTeléfono: ${props.telefono || "No registrado"}`,
                    onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                  });
                }}
              />
            </div>
          )}
        </>
      )}
      {showManualModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "550px" }}>
            <button className="modal-close" onClick={() => setShowManualModal(false)}>×</button>
            <h3 className="modal-title-custom" style={{ color: "var(--color-primary)", fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>Nuevo Turno Manual</h3>
            
            <form onSubmit={handleCreateManualTurno} className="manual-form">
              {modalError && <div className="login-error" style={{ marginBottom: "16px" }}>{modalError}</div>}
              
              <div className="manual-form-section" style={{ marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "15px" }}>
                <h4 className="manual-form-section-title" style={{ fontSize: "15px", marginBottom: "12px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Datos del Cliente Invitado</h4>
                
                <div className="login-form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "4px", color: "var(--color-text-muted)" }}>Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={manualForm.nombre}
                    onChange={(e) => setManualForm(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Ej. Juan Pérez"
                    className="login-input"
                  />
                </div>

                <div className="login-form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "4px", color: "var(--color-text-muted)" }}>Email</label>
                  <input
                    type="email"
                    required
                    value={manualForm.email}
                    onChange={(e) => setManualForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="Ej. juan@correo.com"
                    className="login-input"
                  />
                </div>

                <div className="login-form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "4px", color: "var(--color-text-muted)" }}>Teléfono</label>
                  <input
                    type="text"
                    required
                    value={manualForm.telefono}
                    onChange={(e) => setManualForm(p => ({ ...p, telefono: e.target.value }))}
                    placeholder="Ej. 1122334455"
                    className="login-input"
                  />
                </div>
              </div>

              <div className="manual-form-section" style={{ marginBottom: "20px" }}>
                <h4 className="manual-form-section-title" style={{ fontSize: "15px", marginBottom: "12px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Datos del Turno</h4>
                
                <div className="login-form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "4px", color: "var(--color-text-muted)" }}>Servicio</label>
                  <select
                    required
                    value={manualForm.servicioId}
                    onChange={(e) => setManualForm(p => ({ ...p, servicioId: e.target.value, horaInicio: "" }))}
                    className="login-input"
                  >
                    <option value="">Seleccioná un servicio</option>
                    {barberoProfile?.servicios?.map((s) => (
                      <option key={s.barberoServicioId} value={s.barberoServicioId}>
                        {s.nombre} (${s.precio} · {s.duracion} min)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="login-form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "4px", color: "var(--color-text-muted)" }}>Fecha</label>
                  <input
                    type="date"
                    required
                    value={manualForm.fecha}
                    onChange={(e) => setManualForm(p => ({ ...p, fecha: e.target.value, horaInicio: "" }))}
                    className="login-input"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="login-form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "4px", color: "var(--color-text-muted)" }}>Hora de Inicio</label>
                  <select
                    required
                    value={manualForm.horaInicio}
                    onChange={(e) => setManualForm(p => ({ ...p, horaInicio: e.target.value }))}
                    className="login-input"
                    disabled={!manualForm.servicioId || !manualForm.fecha || disponibilidadHoras.length === 0}
                  >
                    <option value="">
                      {!manualForm.servicioId || !manualForm.fecha
                        ? "Seleccioná primero servicio y fecha"
                        : disponibilidadHoras.length === 0
                        ? "No hay horarios disponibles"
                        : "Seleccioná un horario"}
                    </option>
                    {disponibilidadHoras.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: "24px", justifyContent: "flex-end", gap: "10px", display: "flex" }}>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="btn btn-secondary"
                  style={{ width: "auto" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting || !manualForm.horaInicio}
                  className="btn"
                  style={{ width: "auto" }}
                >
                  {modalSubmitting ? "Creando..." : "Confirmar Turno"}
                </button>
              </div>
            </form>
          </div>
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
