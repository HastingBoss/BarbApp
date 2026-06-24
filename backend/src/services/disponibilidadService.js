const turnoRepository = require("../repositories/turnoRepository");

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// Convierte "HH:mm" a minutos desde medianoche
function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// Genera slots de `duracion` minutos entre horaInicio y horaFin
function generarSlots(horaInicio, horaFin, duracion) {
  const slots = [];
  let current = toMinutes(horaInicio);
  const fin = toMinutes(horaFin);
  while (current + duracion <= fin) {
    const h = String(Math.floor(current / 60)).padStart(2, "0");
    const m = String(current % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    current += duracion;
  }
  return slots;
}

const disponibilidadService = {
  /**
   * Devuelve los horarios disponibles para un barbero en una fecha dada,
   * considerando la duración del servicio y los turnos ya reservados.
   */
  async getHorariosDisponibles(barbero, fecha, duracionServicio) {
    const fechaObj = new Date(fecha);
    const diaNombre = DIAS[fechaObj.getDay()]; // 0=domingo, 1=lunes, ...

    // Todos los barberos trabajan de lunes a sábado de 09:00 a 20:00
    if (diaNombre === "domingo") return []; // cerrado los domingos

    // Todos los slots posibles del día
    const todosSlots = generarSlots(
      "09:00",
      "20:00",
      duracionServicio
    );

    // Turnos ya reservados ese día
    const turnosExistentes = await turnoRepository.findByBarberoAndFecha(
      barbero._id,
      fechaObj
    );

    // Bloquea slots que colisionen con turnos existentes
    const slotsOcupados = new Set();
    for (const turno of turnosExistentes) {
      const inicioOcupado = toMinutes(turno.horaInicio);
      const finOcupado = inicioOcupado + (turno.barberoServicio?.servicio?.duracion || 0);
      // Cualquier slot que se superponga queda bloqueado
      for (const slot of todosSlots) {
        const inicioSlot = toMinutes(slot);
        const finSlot = inicioSlot + duracionServicio;
        if (inicioSlot < finOcupado && finSlot > inicioOcupado) {
          slotsOcupados.add(slot);
        }
      }
    }

    return todosSlots.filter((s) => !slotsOcupados.has(s));
  },
};

module.exports = disponibilidadService;
