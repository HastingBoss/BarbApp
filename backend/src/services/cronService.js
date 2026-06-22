const turnoRepository = require("../repositories/turnoRepository");
const emailService = require("./emailService");

// Lógica de recordatorios extraída como función pura
// — la llama el endpoint /api/cron/recordatorios (Vercel Cron Job)
async function enviarRecordatoriosHoy() {
  const turnos = await turnoRepository.findTurnosHoy();

  if (turnos.length === 0) {
    return { enviados: 0, mensaje: "Sin turnos pendientes hoy" };
  }

  let enviados = 0;
  const errores = [];

  for (const turno of turnos) {
    const cliente = turno.cliente;
    if (!cliente) continue;

    const nombre = cliente.name || cliente.nombre;
    const email = cliente.email;
    if (!email) continue;

    try {
      await emailService.sendRecordatorio({
        to: email,
        nombre,
        barberoNombre: turno.barbero?.user?.name || "el barbero",
        servicio: turno.barberoServicio?.servicio?.nombre || "servicio",
        fecha: new Date(turno.fecha).toLocaleDateString("es-AR"),
        hora: turno.horaInicio,
      });

      await turnoRepository.updateById(turno._id, { recordatorioEnviado: true });
      enviados++;
    } catch (err) {
      errores.push({ turnoId: turno._id, error: err.message });
    }
  }

  console.log(`[CRON] Recordatorios enviados: ${enviados}/${turnos.length}`);
  return { enviados, total: turnos.length, errores };
}

module.exports = { enviarRecordatoriosHoy };
