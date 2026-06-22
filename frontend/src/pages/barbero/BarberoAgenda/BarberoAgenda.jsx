import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import "./BarberoAgenda.css";

export default function BarberoAgenda() {
  const profileRequest = useRequest();
  const turnosRequest = useRequest();
  const actionRequest = useRequest();
  const resumenRequest = useRequest();

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

  const [pendientes, setPendientes] = useState([]);
  const [rejectingTurnoId, setRejectingTurnoId] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

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
    if (window.confirm("¿Marcar este turno como completado?")) {
      actionRequest.sendRequest(async () => {
        await api.patch(`/turnos/${id}/completar`);
        loadTurnos();
      });
    }
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

  // Filter turnos of today
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
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowManualModal(true)} className="btn">
              ➕ Nuevo Turno Manual
            </button>
            <button onClick={toggleResumen} className="btn btn-secondary">
              {showResumen ? " ocultar Resumen" : "📋 Resumen del Día"}
            </button>
          </div>
        )}
      </div>

      {/* Resumen Panel displayed directly below the button */}
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
          <p className="agenda-loading-text">Cargando agenda de hoy...</p>
        </div>
      ) : (
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
                      return (
                        <tr key={t._id} className="agenda-tr">
                           <td className="agenda-td" data-label="Hora"><strong>{t.horaInicio}</strong></td>
                           <td className="agenda-td" data-label="Cliente">{clienteNombre}</td>
                           <td className="agenda-td" data-label="Servicio">{t.barberoServicio?.servicio?.nombre || "Sin servicio"}</td>
                           <td className="agenda-td" data-label="Duración">{(t.barberoServicio?.servicio?.duracion || 0)} min</td>
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

    </div>
  );
}
