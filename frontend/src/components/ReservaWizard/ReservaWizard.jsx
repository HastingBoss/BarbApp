import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import useRequest from "../../hooks/useRequest";
import "./ReservaWizard.css";

const STEPS = ["Servicio", "Barbero", "Fecha y hora", "Tus datos", "Confirmar"];

export default function ReservaWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const { sendRequest, loading, error } = useRequest();

  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [createdTurno, setCreatedTurno] = useState(null);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const handleRedirectToLogin = () => {
    sessionStorage.setItem(
      "pending_reserva",
      JSON.stringify({
        servicio: seleccion.servicio,
        barbero: seleccion.barbero,
        fecha: seleccion.fecha,
        hora: seleccion.hora,
        nombre: seleccion.nombre,
        email: seleccion.email,
        telefono: seleccion.telefono,
      })
    );
    navigate("/login");
  };

  const [seleccion, setSeleccion] = useState({
    servicio: null,
    barbero: null,
    barberoServicioId: "",
    precio: 0,
    fecha: "",
    hora: "",
    nombre: user?.name || "",
    email: user?.email || "",
    telefono: "",
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const MAP_JS_DAY_TO_SPANISH = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const startOffset = (firstDay.getDay() + 6) % 7;
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const today = new Date();
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const nextMonth = () => {
    if (currentMonth.getTime() === minMonth.getTime()) {
      setCurrentMonth(maxMonth);
    }
  };

  const prevMonth = () => {
    if (currentMonth.getTime() === maxMonth.getTime()) {
      setCurrentMonth(minMonth);
    }
  };

  const isDayDisabled = (date) => {
    if (!date) return true;
    
    const compareToday = new Date();
    compareToday.setHours(0, 0, 0, 0);
    if (date < compareToday) return true;
    
    const dayOfWeekIndex = date.getDay();
    const dayName = MAP_JS_DAY_TO_SPANISH[dayOfWeekIndex];
    const worksOnDay = seleccion.barbero?.horarios?.some(
      (h) => h.dia.toLowerCase() === dayName
    );
    if (!worksOnDay) return true;
    
    return false;
  };

  const formatYYYYMMDD = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDayClick = (date) => {
    if (!isDayDisabled(date)) {
      const formatted = formatYYYYMMDD(date);
      setSeleccion((p) => ({ ...p, fecha: formatted, hora: "" }));
    }
  };

  // Paso 0: cargar servicios
  useEffect(() => {
    sendRequest(() => api.get("/servicios").then(setServicios));
  }, []);

  // Mostrar modal de aviso si entra como invitado
  useEffect(() => {
    if (!user) {
      setShowGuestModal(true);
    }
  }, [user]);

  // Restaurar selección pendiente desde sessionStorage si existe
  useEffect(() => {
    const pending = sessionStorage.getItem("pending_reserva");
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        if (parsed) {
          setSeleccion((p) => ({
            ...p,
            ...parsed,
            nombre: user?.name || parsed.nombre || "",
            email: user?.email || parsed.email || "",
          }));
          setStep(user ? 4 : 3);
        }
      } catch (e) {
        console.error("Error al restaurar la reserva pendiente:", e);
      }
      sessionStorage.removeItem("pending_reserva");
    }
  }, [user]);

  // Paso 1: cargar barberos cuando se elige servicio
  useEffect(() => {
    if (seleccion.servicio) {
      sendRequest(() =>
        api
          .get(`/barbero-servicios/servicio/${seleccion.servicio._id}`)
          .then(setBarberos)
      );
    }
  }, [seleccion.servicio]);

  // Paso 2: cargar disponibilidad cuando se elige barbero y fecha
  useEffect(() => {
    if (seleccion.barbero && seleccion.fecha) {
      sendRequest(() =>
        api
          .get(
            `/turnos/disponibilidad?barberoId=${seleccion.barbero._id}&servicioId=${seleccion.servicio._id}&fecha=${seleccion.fecha}`
          )
          .then((data) => setHorarios(data.horarios))
      );
    }
  }, [seleccion.barbero, seleccion.fecha]);



  async function confirmar() {
    const body = {
      barberoId: seleccion.barbero._id,
      barberoServicioId: seleccion.barberoServicioId,
      fecha: seleccion.fecha,
      horaInicio: seleccion.hora,
      ...(!user && {
        nombre: seleccion.nombre,
        email: seleccion.email,
        telefono: seleccion.telefono,
      }),
    };
    await sendRequest(() => 
      api.post("/turnos", body).then((res) => {
        setCreatedTurno(res);
        setSuccess(true);
      })
    );
  }



  if (success) {
    return (
      <div className="reserva-success">
        <h2>✅ ¡Turno confirmado!</h2>

        <p>Tu turno fue confirmado exitosamente. Te enviamos un correo con los detalles.</p>
      </div>
    );
  }

  return (
    <div className="reserva-wizard">


      {/* Stepper */}
      <div className="stepper">
        <div className="stepper-desktop">
          {STEPS.map((label, i) => (
            <span key={label} className={`step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
              {label}
            </span>
          ))}
        </div>
        <div className="stepper-mobile">
          Paso {step + 1} / {STEPS.length}: <strong>{STEPS[step]}</strong>
        </div>
      </div>

      {error && (
        error.includes("ya tiene una cuenta registrada") ? (
          <div className="conflict-error-box">
            <span className="conflict-error-text">{error}</span>
            <div className="conflict-error-actions">
              <button 
                type="button" 
                className="btn btn-login-redirect" 
                onClick={handleRedirectToLogin}
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        ) : (
          <p className="error">{error}</p>
        )
      )}

      {/* Paso 0 — Elegir servicio */}
      {step === 0 && (
        <div>
          <h3 className="wizard-title">¿Qué servicio querés?</h3>
          <div className="cards">
            {servicios.map((s) => (
              <button
                key={s._id}
                className={`card ${seleccion.servicio?._id === s._id ? "selected" : ""}`}
                onClick={() => setSeleccion((p) => ({ ...p, servicio: s, barbero: null, barberoServicioId: "", precio: 0, hora: "" }))}
              >
                <strong>{s.nombre}</strong>
                <span>{s.duracion} min</span>
              </button>
            ))}
          </div>
          <button disabled={!seleccion.servicio} onClick={() => setStep(1)} className="btn">
            Siguiente →
          </button>
        </div>
      )}

      {/* Paso 1 — Elegir barbero */}
      {step === 1 && (
        <div>
          <h3 className="wizard-title">Elegí tu barbero</h3>
          <div className="cards">
            {barberos.map((b) => (
              <button
                key={b._id}
                className={`card ${seleccion.barberoServicioId === b._id ? "selected" : ""}`}
                onClick={() => setSeleccion((p) => ({ ...p, barbero: b.barbero, barberoServicioId: b._id, precio: b.precio, hora: "" }))}
              >
                <strong>{b.barbero?.user?.name}</strong>
                <span>Precio: ${b.precio}</span>
              </button>
            ))}
          </div>
          <div className="nav">
            <button onClick={() => setStep(0)} className="btn btn-secondary">← Atrás</button>
            <button disabled={!seleccion.barbero} onClick={() => setStep(2)} className="btn">
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Paso 2 — Fecha y hora */}
      {step === 2 && (
        <div>
          <h3 className="wizard-title">Elegí fecha y hora</h3>
          
          <div className="fecha-picker">
            <div className="calendar-header">
              <button 
                type="button" 
                onClick={prevMonth} 
                disabled={currentMonth.getTime() === minMonth.getTime()}
                className="calendar-nav-btn"
              >
                ◀
              </button>
              <span className="calendar-month-name">
                {currentMonth.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
              </span>
              <button 
                type="button" 
                onClick={nextMonth} 
                disabled={currentMonth.getTime() === maxMonth.getTime()}
                className="calendar-nav-btn"
              >
                ▶
              </button>
            </div>
            <div className="calendar-weekdays">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
            <div className="calendar-days-grid">
              {getDaysInMonth(currentMonth).map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                }
                const formatted = formatYYYYMMDD(date);
                const isSelected = seleccion.fecha === formatted;
                const disabled = isDayDisabled(date);
                return (
                  <button
                    key={formatted}
                    type="button"
                    onClick={() => handleDayClick(date)}
                    disabled={disabled}
                    className={`calendar-day ${isSelected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {seleccion.fecha && (
            <div className="horarios">
              {horarios.length === 0 ? (
                <p>No hay horarios disponibles para ese día.</p>
              ) : (
                horarios.map((h) => (
                  <button
                    key={h}
                    className={`hora-btn ${seleccion.hora === h ? "selected" : ""}`}
                    onClick={() => setSeleccion((p) => ({ ...p, hora: h }))}
                  >
                    {h}
                  </button>
                ))
              )}
            </div>
          )}
          <div className="nav">
            <button onClick={() => setStep(1)} className="btn btn-secondary">← Atrás</button>
            <button disabled={!seleccion.hora} onClick={() => setStep(user ? 4 : 3)} className="btn">
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Paso 3 — Datos del invitado (solo si no está logueado) */}
      {step === 3 && !user && (
        <div>
          <h3 className="wizard-title">Tus datos</h3>
          <input
            placeholder="Nombre"
            value={seleccion.nombre}
            onChange={(e) => setSeleccion((p) => ({ ...p, nombre: e.target.value }))}
          />
          <input
            type="email"
            placeholder="Email"
            value={seleccion.email}
            onChange={(e) => setSeleccion((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            placeholder="Teléfono"
            value={seleccion.telefono}
            onChange={(e) => setSeleccion((p) => ({ ...p, telefono: e.target.value }))}
          />
          <div className="nav">
            <button onClick={() => setStep(2)} className="btn btn-secondary">← Atrás</button>
            <button
              disabled={!seleccion.nombre || !seleccion.email || !seleccion.telefono}
              onClick={() => setStep(4)}
              className="btn"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Paso 4 — Resumen y confirmar */}
      {step === 4 && (
        <div>
          <h3 className="wizard-title">Resumen</h3>
          <ul>
            <li><strong>Servicio:</strong> {seleccion.servicio?.nombre}</li>
            <li><strong>Barbero:</strong> {seleccion.barbero?.user?.name}</li>
            <li><strong>Precio:</strong> ${seleccion.precio}</li>
            <li><strong>Fecha:</strong> {seleccion.fecha}</li>
            <li><strong>Hora:</strong> {seleccion.hora}</li>

            {!user && (
              <>
                <li><strong>Nombre:</strong> {seleccion.nombre}</li>
                <li><strong>Email:</strong> {seleccion.email}</li>
              </>
            )}
          </ul>
          <div className="nav">
            <button onClick={() => setStep(user ? 2 : 3)} className="btn btn-secondary">← Atrás</button>
            <button onClick={confirmar} disabled={loading} className="btn">
              {loading ? "Reservando..." : "Confirmar turno"}
            </button>
          </div>
        </div>
      )}

      {/* Guest warning modal */}
      {showGuestModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-beneficios">
            <h3>Atención</h3>
            <p className="modal-intro">
              Estás reservando como invitado. Registrarte es gratis y te permite llevar un historial de tus reservas.
            </p>
            <div className="modal-footer modal-beneficios-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowGuestModal(false)}
              >
                Continuar igual
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={() => navigate("/register")}
              >
                Registrarme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
