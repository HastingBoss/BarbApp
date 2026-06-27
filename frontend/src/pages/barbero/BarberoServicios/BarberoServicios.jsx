import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import useRequest from "../../../hooks/useRequest";
import "./BarberoServicios.css";

export default function BarberoServicios() {
  const { sendRequest: fetchProfile, loading: loadingProfile } = useRequest();
  const { sendRequest: fetchAllServicios, loading: loadingServicios } = useRequest();
  const { sendRequest: fetchRelations, loading: loadingRelations } = useRequest();
  const { sendRequest: fetchConfig } = useRequest();
  const { sendRequest: saveRequest, loading: savingServicios, error: saveError } = useRequest();

  const [barberoProfile, setBarberoProfile] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [config, setConfig] = useState({ porcentajeSalon: 0 });
  const [tempServicios, setTempServicios] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    fetchProfile(() =>
      api.get("/barberos/me/perfil").then(async (profile) => {
        if (profile && profile._id) {
          setBarberoProfile(profile);

          const servicesData = await api.get("/servicios");
          setServicios(servicesData);

          const configData = await api.get("/config");
          setConfig(configData || { porcentajeSalon: 0 });

          const relationsData = await api.get(`/barbero-servicios/barbero/${profile._id}`);
          
          const mapped = servicesData.map((s) => {
            const match = relationsData.find((r) => r.servicio?._id === s._id || r.servicio === s._id);
            return {
              servicioId: s._id,
              nombre: s.nombre,
              precioBase: s.precioBase,
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
        }
      })
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckboxChange = (index) => {
    setTempServicios((prev) =>
      prev.map((item, i) => (i === index ? { ...item, active: !item.active } : item))
    );
  };

  const handleValueChange = (index, field, value) => {
    setTempServicios((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("");

    saveRequest(async () => {
      for (const item of tempServicios) {
        const precio = item.precio === "" ? "" : Number(item.precio);
        const duracion = item.duracion === "" ? "" : Number(item.duracion);

        if (item.active && !item.relationId) {
          // Create new relation
          await api.post("/barbero-servicios", {
            barbero: barberoProfile._id,
            servicio: item.servicioId,
            porcentaje: precio === "" ? undefined : precio,
            duracion: duracion === "" ? undefined : duracion
          });
        } else if (!item.active && item.relationId && item.originalActive) {
          // Soft-delete relation
          await api.delete(`/barbero-servicios/${item.relationId}`);
        } else if (item.active && item.relationId) {
          // Update relation if changed
          if (
            item.precio !== item.originalPrecio ||
            item.duracion !== item.originalDuracion ||
            !item.originalActive
          ) {
            await api.put(`/barbero-servicios/${item.relationId}`, {
              porcentaje: precio === "" ? "" : precio,
              duracion: duracion === "" ? "" : duracion,
              active: true
            });
          }
        }
      }

      setSuccessMsg("Tus servicios se han actualizado correctamente");
      setTimeout(() => setSuccessMsg(""), 4000);
      loadData();
    });
  };

  const isLoading = loadingProfile || loadingServicios || loadingRelations;

  return (
    <div className="barbero-servicios-container">
      <div className="barbero-servicios-header">
        <h1>Mis <span>Servicios Habilitados</span></h1>
        <p className="subtitle">
          Seleccioná qué servicios ofrecés. La comisión y duración son administradas y configuradas únicamente por el administrador.
        </p>
      </div>

      {successMsg && (
        <div className="success-toast" style={{ marginBottom: "20px" }}>
          {successMsg}
        </div>
      )}

      {saveError && (
        <div className="login-error" style={{ marginBottom: "20px" }}>
          Error al guardar: {saveError}
        </div>
      )}

      {isLoading ? (
        <div className="empty-text">
          <div className="loading-spinner"></div>
          <p>Cargando servicios y configuración...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="barbero-servicios-card">
          <div className="services-grid">
            {tempServicios.map((item, index) => {
              const baseWithMarkup = Math.round(item.precioBase * (1 + config.porcentajeSalon / 100) * 100) / 100;

              return (
                <div key={item.servicioId} className={`service-item-row ${item.active ? "active" : ""}`}>
                  <div className="service-info-col">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={() => handleCheckboxChange(index)}
                      />
                      <span className="checkmark"></span>
                      <div className="service-name-wrapper">
                        <span className="service-title">{item.nombre}</span>
                        <span className="service-base-info">
                          Base: ${item.precioBase} • {item.duracionBase} min
                        </span>
                      </div>
                    </label>
                  </div>

                  {item.active && (
                    <div className="service-custom-col">
                      <div className="custom-field">
                        <label>Porcentaje Comisión (%)</label>
                        <div className="input-with-preview">
                          <input
                            type="number"
                            min="0"
                            placeholder={item.precio !== "" ? `${item.precio}%` : `Por defecto: ${config.porcentajeSalon}%`}
                            value={item.precio}
                            onChange={(e) => handleValueChange(index, "precio", e.target.value)}
                            className="login-input"
                            disabled
                            style={{ opacity: 0.7, cursor: "not-allowed" }}
                          />
                        </div>
                      </div>

                      <div className="custom-field">
                        <label>Duración</label>
                        <select
                          value={item.duracion}
                          onChange={(e) => handleValueChange(index, "duracion", e.target.value)}
                          className="login-input"
                          disabled
                          style={{ opacity: 0.7, cursor: "not-allowed" }}
                        >
                          <option value="">Por defecto: {item.duracionBase} min</option>
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
              );
            })}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-save"
              disabled={savingServicios}
            >
              {savingServicios ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
