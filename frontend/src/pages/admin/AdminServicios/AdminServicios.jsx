import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import { useForm } from "../../../hooks/useForm";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import "./AdminServicios.css";

export default function AdminServicios() {
  const { sendRequest: fetchServicios, response: serviciosResponse, loading: loadingServicios } = useRequest();
  const { sendRequest: crearServicio, loading: creandoServicio, error: crearServicioError } = useRequest();
  const { sendRequest: actualizarServicio, loading: actualizandoServicio, error: actualizarServicioError } = useRequest();
  const { sendRequest: eliminarServicio, loading: eliminandoServicio, error: eliminarServicioError } = useRequest();
  const { sendRequest: reactivarServicio, loading: reactivandoServicio, error: reactivarServicioError } = useRequest();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [activeModal, setActiveModal] = useState(null); // 'create' | 'edit' | null
  const [selectedServicio, setSelectedServicio] = useState(null);

  // Form for new service
  const { values: newValues, handleChange: handleNewChange, reset: resetNew } = useForm({
    nombre: "",
    precioBase: "",
    duracion: "30",
  });

  // Form for editing service
  const [editValues, setEditValues] = useState({
    nombre: "",
    precioBase: "",
    duracion: "",
  });

  const loadServicios = () => {
    fetchServicios(() => api.get("/servicios"));
  };

  useEffect(() => {
    loadServicios();
  }, []);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    crearServicio(async () => {
      await api.post("/servicios", {
        nombre: newValues.nombre,
        precioBase: Number(newValues.precioBase),
        duracion: Number(newValues.duracion),
      });
      resetNew();
      setActiveModal(null);
      loadServicios();
    });
  };

  const openEditModal = (servicio) => {
    setSelectedServicio(servicio);
    setEditValues({
      nombre: servicio.nombre,
      precioBase: servicio.precioBase,
      duracion: servicio.duracion,
    });
    setActiveModal("edit");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    actualizarServicio(async () => {
      await api.put(`/servicios/${selectedServicio._id}`, {
        nombre: editValues.nombre,
        precioBase: Number(editValues.precioBase),
        duracion: Number(editValues.duracion),
      });
      setActiveModal(null);
      loadServicios();
    });
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Servicio",
      message: "¿Estás seguro de que querés eliminar este servicio?",
      onConfirm: () => {
        eliminarServicio(async () => {
          await api.delete(`/servicios/${id}`);
          loadServicios();
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleReactivate = (servicio) => {
    reactivarServicio(async () => {
      await api.put(`/servicios/${servicio._id}`, { active: true });
      loadServicios();
    });
  };

  const servicios = serviciosResponse || [];
  const currentError = crearServicioError || actualizarServicioError || eliminarServicioError || reactivarServicioError;

  return (
    <div>
      <div className="servicios-header">
        <h1>Gestión de <span>Servicios</span></h1>
        <button onClick={() => setActiveModal("create")} className="btn">
          Nuevo Servicio
        </button>
      </div>

      {currentError && (
        <div className="login-error">
          Error: {currentError}
        </div>
      )}

      {loadingServicios ? (
        <div className="empty-text">
          <div className="loading-spinner"></div>
          <p className="servicios-loading-text">Cargando servicios...</p>
        </div>
      ) : (
        <div className="servicios-table-container">
          {servicios.length === 0 ? (
            <p className="empty-text">
              No hay servicios registrados.
            </p>
          ) : (
            <table className="servicios-table">
              <thead>
                <tr>
                  <th className="servicios-th">Nombre</th>
                  <th className="servicios-th">Precio Base</th>
                  <th className="servicios-th">Duración</th>
                  <th className="servicios-th">Estado</th>
                  <th className="servicios-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((s) => (
                  <tr key={s._id} className="servicios-tr">
                    <td className="servicios-td" data-label="Nombre"><strong>{s.nombre}</strong></td>
                    <td className="servicios-td" data-label="Precio Base">${s.precioBase}</td>
                    <td className="servicios-td" data-label="Duración">{s.duracion} min</td>
                    <td className="servicios-td" data-label="Estado">
                      <span className={`dashboard-badge ${s.active ? "dashboard-badge-completado" : "dashboard-badge-cancelado"}`}>
                        {s.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="servicios-td" data-label="Acciones">
                      <div className="actions-cell">
                        <button onClick={() => openEditModal(s)} className="btn btn-secondary btn-sm">
                          Editar
                        </button>
                        {s.active ? (
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="btn btn-danger btn-sm"
                            disabled={eliminandoServicio}
                          >
                            Eliminar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(s)}
                            className="btn btn-sm"
                            disabled={reactivandoServicio}
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal: Create Servicio */}
      {activeModal === "create" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h3>Crear Nuevo Servicio</h3>
            <form onSubmit={handleCreateSubmit} className="login-form">
              <div className="login-form-group">
                <label htmlFor="create-nombre">Nombre del Servicio</label>
                <input
                  id="create-nombre"
                  type="text"
                  name="nombre"
                  required
                  value={newValues.nombre}
                  onChange={handleNewChange}
                  placeholder="Ej: Corte de Pelo + Barba"
                  className="login-input"
                />
              </div>
              <div className="login-form-group">
                <label htmlFor="create-precio">Precio Base ($)</label>
                <input
                  id="create-precio"
                  type="number"
                  name="precioBase"
                  required
                  min="0"
                  value={newValues.precioBase}
                  onChange={handleNewChange}
                  placeholder="2500"
                  className="login-input"
                />
              </div>
              <div className="login-form-group">
                <label htmlFor="create-duracion">Duración (minutos)</label>
                <select
                  id="create-duracion"
                  name="duracion"
                  value={newValues.duracion}
                  onChange={handleNewChange}
                  className="login-input"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn" disabled={creandoServicio}>
                  {creandoServicio ? "Creando..." : "Crear Servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Servicio */}
      {activeModal === "edit" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h3>Editar Servicio</h3>
            <form onSubmit={handleEditSubmit} className="login-form">
              <div className="login-form-group">
                <label htmlFor="edit-nombre">Nombre del Servicio</label>
                <input
                  id="edit-nombre"
                  type="text"
                  name="nombre"
                  required
                  value={editValues.nombre}
                  onChange={handleEditChange}
                  className="login-input"
                />
              </div>
              <div className="login-form-group">
                <label htmlFor="edit-precio">Precio Base ($)</label>
                <input
                  id="edit-precio"
                  type="number"
                  name="precioBase"
                  required
                  min="0"
                  value={editValues.precioBase}
                  onChange={handleEditChange}
                  className="login-input"
                />
              </div>
              <div className="login-form-group">
                <label htmlFor="edit-duracion">Duración (minutos)</label>
                <select
                  id="edit-duracion"
                  name="duracion"
                  value={editValues.duracion}
                  onChange={handleEditChange}
                  className="login-input"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn" disabled={actualizandoServicio}>
                  {actualizandoServicio ? "Guardando..." : "Guardar Cambios"}
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
