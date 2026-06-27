import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import { useForm } from "../../../hooks/useForm";
import "./AdminBarberos.css";



export default function AdminBarberos() {
  const { sendRequest: fetchBarberos, response: barberosResponse, loading: loadingBarberos } = useRequest();
  const { sendRequest: fetchServicios, response: serviciosResponse, loading: loadingServicios } = useRequest();
  const { sendRequest: crearBarbero, loading: creandoBarbero, error: crearBarberoError } = useRequest();
  const { sendRequest: actualizarEstado, loading: actualizandoEstado, error: actualizarEstadoError } = useRequest();

  const [actualizandoServicios, setActualizandoServicios] = useState(false);
  const [actualizarServiciosError, setActualizarServiciosError] = useState("");
  const [loadingServiciosRelations, setLoadingServiciosRelations] = useState(false);

  const [activeModal, setActiveModal] = useState(null); // 'create' | 'servicios' | null
  const [selectedBarbero, setSelectedBarbero] = useState(null);
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
          duracionBase: s.duracion,
          active: match ? match.active : false,
          precio: match && match.precioCustom !== undefined && match.precioCustom !== null ? match.precioCustom : "",
          duracion: match && match.duracionCustom !== undefined && match.duracionCustom !== null ? match.duracionCustom : "",
          relationId: match ? match._id : null,
          originalActive: match ? match.active : false,
          originalPrecio: match && match.precioCustom !== undefined && match.precioCustom !== null ? match.precioCustom : "",
          originalDuracion: match && match.duracionCustom !== undefined && match.duracionCustom !== null ? match.duracionCustom : ""

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
        const porcentaje = item.precio === "" ? undefined : Number(item.precio);
        const duracion = item.duracion === "" ? undefined : Number(item.duracion);

        if (item.active && !item.relationId) {
          await api.post("/barbero-servicios", {
            barbero: selectedBarbero._id,
            servicio: item.servicioId,
            porcentaje,
            duracion
          });
        } else if (!item.active && item.relationId && item.originalActive) {
          await api.delete(`/barbero-servicios/${item.relationId}`);
        } else if (item.active && item.relationId) {
          if (item.precio !== item.originalPrecio || item.duracion !== item.originalDuracion || !item.originalActive) {
            await api.put(`/barbero-servicios/${item.relationId}`, {
              porcentaje,
              duracion,
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
  const currentError = crearBarberoError || actualizarServiciosError || actualizarEstadoError;

  return (
    <div>
      <div className="barberos-header">
        <h1>Gestión de <span>Barberos</span></h1>
        <button onClick={() => setActiveModal("create")} className="btn">
          Nuevo Barbero
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
                  <td className="barberos-td" data-label="Estado">
                    <span className={`dashboard-badge ${b.active ? "dashboard-badge-completado" : "dashboard-badge-cancelado"}`}>
                      {b.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="barberos-td" data-label="Acciones">
                    <div className="actions-cell">
                      <button onClick={() => openServiciosModal(b)} className="btn btn-secondary btn-sm">
                        Servicios
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
                    <div key={item.servicioId} style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <label className="checkbox-label" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="checkbox"
                            checked={item.active}
                            onChange={() => {
                              setTempServicios(prev => prev.map((x, i) => i === index ? { ...x, active: !x.active } : x));
                            }}
                          />
                          <span>
                            <strong>{item.nombre}</strong> (Base: {item.duracionBase} min)
                          </span>
                        </label>
                      </div>
                      {item.active && (
                        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", marginBottom: "2px" }}>Porcentaje Comisión (%)</label>
                            <input
                              type="number"
                              min="0"
                              value={item.precio}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTempServicios(prev => prev.map((x, i) => i === index ? { ...x, precio: val } : x));
                              }}
                              className="login-input"
                              style={{ padding: "6px 8px", margin: 0, fontSize: "13px" }}
                              placeholder="Por defecto del salón"
                            />
                          </div>

                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", marginBottom: "2px" }}>Duración Custom (Opcional)</label>
                            <select
                              value={item.duracion}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTempServicios(prev => prev.map((x, i) => i === index ? { ...x, duracion: val } : x));
                              }}
                              className="login-input"
                              style={{ padding: "6px 8px", margin: 0, fontSize: "13px", height: "auto" }}
                            >
                              <option value="">Por defecto (base)</option>
                              <option value="15">15 min</option>
                              <option value="30">30 min</option>
                              <option value="45">45 min</option>
                              <option value="60">60 min</option>
                              <option value="90">90 min</option>
                              <option value="120">120 min</option>
                            </select>
                          </div>
                        </div>
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
