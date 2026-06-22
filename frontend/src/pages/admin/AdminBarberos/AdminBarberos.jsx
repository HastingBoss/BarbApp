import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import { useForm } from "../../../hooks/useForm";
import "./AdminBarberos.css";

const DAYS_OF_WEEK = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

function generarOpciones() {
  const opciones = []
  for (let h = 6; h <= 22; h++) {
    for (let m of [0, 30]) {
      const hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      opciones.push(hora)
    }
  }
  return opciones
}

const opcionesHora = generarOpciones();

export default function AdminBarberos() {
  const { sendRequest: fetchBarberos, response: barberosResponse, loading: loadingBarberos } = useRequest();
  const { sendRequest: fetchServicios, response: serviciosResponse, loading: loadingServicios } = useRequest();
  const { sendRequest: crearBarbero, loading: creandoBarbero, error: crearBarberoError } = useRequest();
  const { sendRequest: actualizarHorarios, loading: actualizandoHorarios, error: actualizarHorariosError } = useRequest();
  const { sendRequest: actualizarEstado, loading: actualizandoEstado, error: actualizarEstadoError } = useRequest();

  const [actualizandoServicios, setActualizandoServicios] = useState(false);
  const [actualizarServiciosError, setActualizarServiciosError] = useState("");
  const [loadingServiciosRelations, setLoadingServiciosRelations] = useState(false);

  const [activeModal, setActiveModal] = useState(null); // 'create' | 'horarios' | 'servicios' | null
  const [selectedBarbero, setSelectedBarbero] = useState(null);

  // For horarios modal
  const [tempHorarios, setTempHorarios] = useState([]);
  // For servicios modal
  const [tempServicios, setTempServicios] = useState([]);

  const { values: newBarberoValues, handleChange: handleNewBarberoChange, reset: resetNewBarbero } = useForm({
    name: "",
    email: "",
    password: "",
  });

  const loadData = () => {
    fetchBarberos(() => api.get("/barberos"));
    fetchServicios(() => api.get("/servicios"));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    crearBarbero(async () => {
      await api.post("/barberos", newBarberoValues);
      resetNewBarbero();
      setActiveModal(null);
      loadData();
    });
  };

  const openHorariosModal = (barbero) => {
    setSelectedBarbero(barbero);
    const mapped = DAYS_OF_WEEK.map((d) => {
      const match = barbero.horarios?.find((h) => h.dia === d);
      return {
        dia: d,
        horaInicio: match ? match.horaInicio : "09:00",
        horaFin: match ? match.horaFin : "18:00",
        active: !!match,
      };
    });
    setTempHorarios(mapped);
    setActiveModal("horarios");
  };

  const handleHorarioCheckboxChange = (index) => {
    setTempHorarios((prev) =>
      prev.map((h, i) => (i === index ? { ...h, active: !h.active } : h))
    );
  };

  const handleHorarioTimeChange = (index, field, value) => {
    setTempHorarios((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  };

  const saveHorarios = (e) => {
    e.preventDefault();
    const payload = tempHorarios
      .filter((h) => h.active)
      .map(({ dia, horaInicio, horaFin }) => ({ dia, horaInicio, horaFin }));

    actualizarHorarios(async () => {
      await api.put(`/barberos/${selectedBarbero._id}/horarios`, { horarios: payload });
      setActiveModal(null);
      loadData();
    });
  };

  const openServiciosModal = async (barbero) => {
    setSelectedBarbero(barbero);
    setActiveModal("servicios");
    setLoadingServiciosRelations(true);
    setActualizarServiciosError("");
    try {
      const relations = await api.get(`/barbero-servicios/barbero/${barbero._id}`);
      const mapped = servicios.map((s) => {
        const match = relations.find((r) => r.servicio?._id === s._id || r.servicio === s._id);
        return {
          servicioId: s._id,
          nombre: s.nombre,
          duracion: s.duracion,
          active: match ? match.active : false,
          precio: match ? match.precio : s.precio || 0,
          relationId: match ? match._id : null,
          originalActive: match ? match.active : false,
          originalPrecio: match ? match.precio : 0
        };
      });
      setTempServicios(mapped);
    } catch (err) {
      console.error("Error al cargar servicios del barbero:", err);
      setActualizarServiciosError("Error al cargar servicios del barbero");
    } finally {
      setLoadingServiciosRelations(false);
    }
  };

  const saveServicios = async (e) => {
    e.preventDefault();
    setActualizandoServicios(true);
    setActualizarServiciosError("");
    try {
      for (const item of tempServicios) {
        if (item.active && !item.relationId) {
          // POST /api/barbero-servicios
          await api.post("/barbero-servicios", {
            barbero: selectedBarbero._id,
            servicio: item.servicioId,
            precio: item.precio
          });
        } else if (!item.active && item.relationId && item.originalActive) {
          // DELETE /api/barbero-servicios/:id (soft delete)
          await api.delete(`/barbero-servicios/${item.relationId}`);
        } else if (item.active && item.relationId) {
          // Update price or reactivate if changed
          if (item.precio !== item.originalPrecio || !item.originalActive) {
            await api.put(`/barbero-servicios/${item.relationId}`, {
              precio: item.precio,
              active: true
            });
          }
        }
      }
      setActiveModal(null);
      loadData();
    } catch (err) {
      console.error("Error al guardar servicios:", err);
      setActualizarServiciosError(err.message || "Error al guardar servicios");
    } finally {
      setActualizandoServicios(false);
    }
  };

  const toggleBarberoStatus = (barbero) => {
    actualizarEstado(async () => {
      await api.put(`/barberos/${barbero._id}`, { active: !barbero.active });
      loadData();
    });
  };

  const barberos = barberosResponse || [];
  const servicios = serviciosResponse || [];
  const currentError = crearBarberoError || actualizarHorariosError || actualizarServiciosError || actualizarEstadoError;

  return (
    <div>
      <div className="barberos-header">
        <h1>Gestión de <span>Barberos</span></h1>
        <button onClick={() => setActiveModal("create")} className="btn">
          ➕ Nuevo Barbero
        </button>
      </div>

      {currentError && (
        <div className="login-error">
          Error: {currentError}
        </div>
      )}

      {loadingBarberos ? (
        <div className="empty-text">
          <div className="loading-spinner"></div>
          <p className="barberos-loading-text">Cargando barberos...</p>
        </div>
      ) : (
        <div className="barberos-table-container">
          <table className="barberos-table">
            <thead>
              <tr>
                <th className="barberos-th">Nombre</th>
                <th className="barberos-th">Email</th>
                <th className="barberos-th">Servicios</th>
                <th className="barberos-th">Horarios</th>
                <th className="barberos-th">Estado</th>
                <th className="barberos-th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {barberos.map((b) => (
                <tr key={b._id} className="barberos-tr">
                  <td className="barberos-td" data-label="Nombre"><strong>{b.user?.name || "Sin nombre"}</strong></td>
                  <td className="barberos-td" data-label="Email">{b.user?.email}</td>
                  <td className="barberos-td" data-label="Servicios">
                    <span className="barberos-count-label">
                      {b.servicios?.length || 0} servicio(s)
                    </span>
                  </td>
                  <td className="barberos-td" data-label="Horarios">
                    <span className="barberos-count-label">
                      {b.horarios?.length || 0} día(s)
                    </span>
                  </td>
                  <td className="barberos-td" data-label="Estado">
                    <span className={`dashboard-badge ${b.active ? "dashboard-badge-completado" : "dashboard-badge-cancelado"}`}>
                      {b.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="barberos-td" data-label="Acciones">
                    <div className="actions-cell">
                      <button onClick={() => openHorariosModal(b)} className="btn btn-secondary btn-sm">
                        🗓️ Horarios
                      </button>
                      <button onClick={() => openServiciosModal(b)} className="btn btn-secondary btn-sm">
                        ✂️ Servicios
                      </button>
                      <button
                        onClick={() => toggleBarberoStatus(b)}
                        className={`btn btn-sm ${b.active ? "btn-danger" : ""}`}
                        disabled={actualizandoEstado}
                      >
                        {b.active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create Barbero */}
      {activeModal === "create" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h3>Registrar Nuevo Barbero</h3>
            <form onSubmit={handleCreateSubmit} className="login-form">
              <div className="login-form-group">
                <label htmlFor="create-name">Nombre Completo</label>
                <input
                  id="create-name"
                  type="text"
                  name="name"
                  required
                  value={newBarberoValues.name}
                  onChange={handleNewBarberoChange}
                  placeholder="Ej: Marcos Pérez"
                  className="login-input"
                />
              </div>
              <div className="login-form-group">
                <label htmlFor="create-email">Email</label>
                <input
                  id="create-email"
                  type="email"
                  name="email"
                  required
                  value={newBarberoValues.email}
                  onChange={handleNewBarberoChange}
                  placeholder="marcos@barber.com"
                  className="login-input"
                />
              </div>
              <div className="login-form-group">
                <label htmlFor="create-password">Contraseña</label>
                <input
                  id="create-password"
                  type="password"
                  name="password"
                  required
                  value={newBarberoValues.password}
                  onChange={handleNewBarberoChange}
                  placeholder="••••••••"
                  className="login-input"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn" disabled={creandoBarbero}>
                  {creandoBarbero ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Horarios */}
      {activeModal === "horarios" && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-lg">
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h3>Editar Horarios: {selectedBarbero?.user?.name}</h3>
            <form onSubmit={saveHorarios}>
              <div className="modal-scrollable-body">
                {tempHorarios.map((h, index) => (
                  <div key={h.dia} className="day-slot-item">
                    <label className="checkbox-label day-label-wrapper">
                      <input
                        type="checkbox"
                        checked={h.active}
                        onChange={() => handleHorarioCheckboxChange(index)}
                      />
                      <span className="day-text-span">{h.dia}</span>
                    </label>

                    {h.active && (
                      <div className="time-inputs-wrapper">
                        <select
                          value={h.horaInicio}
                          onChange={(e) => handleHorarioTimeChange(index, "horaInicio", e.target.value)}
                          className="hora-select"
                          required
                        >
                          {opcionesHora.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <span className="time-separator">a</span>
                        <select
                          value={h.horaFin}
                          onChange={(e) => handleHorarioTimeChange(index, "horaFin", e.target.value)}
                          className="hora-select"
                          required
                        >
                          {opcionesHora.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn" disabled={actualizandoHorarios}>
                  {actualizandoHorarios ? "Guardando..." : "Guardar Horarios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Servicios */}
      {activeModal === "servicios" && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h3>Servicios Habilitados: {selectedBarbero?.user?.name}</h3>
            {actualizarServiciosError && (
              <div className="login-error" style={{ marginBottom: "15px" }}>
                {actualizarServiciosError}
              </div>
            )}
            <form onSubmit={saveServicios}>
              <div className="services-scrollable-body" style={{ maxHeight: "350px", overflowY: "auto", marginBottom: "20px" }}>
                {loadingServiciosRelations ? (
                  <div className="empty-text">
                    <div className="loading-spinner"></div>
                  </div>
                ) : tempServicios.length === 0 ? (
                  <p className="no-services-text">No hay servicios cargados en el sistema.</p>
                ) : (
                  tempServicios.map((item, index) => (
                    <div key={item.servicioId} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
                      <label className="checkbox-label" style={{ flex: 1, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={() => {
                            setTempServicios(prev => prev.map((x, i) => i === index ? { ...x, active: !x.active } : x));
                          }}
                        />
                        <span>
                          <strong>{item.nombre}</strong> ({item.duracion} min)
                        </span>
                      </label>
                      {item.active && (
                        <input
                          type="number"
                          min="0"
                          value={item.precio}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTempServicios(prev => prev.map((x, i) => i === index ? { ...x, precio: val } : x));
                          }}
                          className="login-input"
                          style={{ width: "100px", padding: "6px 8px", margin: 0 }}
                          placeholder="Precio"
                          required
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn" disabled={actualizandoServicios || loadingServiciosRelations}>
                  {actualizandoServicios ? "Guardando..." : "Guardar Servicios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
