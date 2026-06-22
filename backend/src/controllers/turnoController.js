const turnoRepository = require("../repositories/turnoRepository");
const barberoRepository = require("../repositories/barberoRepository");
const servicioRepository = require("../repositories/servicioRepository");
const configRepository = require("../repositories/configRepository");
const authRepository = require("../repositories/authRepository");
const barberoServicioRepository = require("../repositories/barberoServicioRepository");
const ClienteInvitado = require("../models/ClienteInvitado");
const disponibilidadService = require("../services/disponibilidadService");
const emailService = require("../services/emailService");
const ServerError = require("../utils/ServerError");

const turnoController = {
  // POST /api/turnos — reservar turno (cliente registrado o invitado)
  async reservar(req, res, next) {
    try {
      const {
        barberoId,
        barberoServicioId,
        fecha,
        horaInicio,
        // Para cliente invitado:
        nombre,
        email,
        telefono,
      } = req.body;

      if (!barberoId || !barberoServicioId || !fecha || !horaInicio) {
        throw ServerError.badRequest("barberoId, barberoServicioId, fecha y horaInicio son requeridos");
      }

      const barbero = await barberoRepository.findById(barberoId);
      if (!barbero) throw ServerError.notFound("Barbero no encontrado");

      const barberoServicio = await barberoServicioRepository.findById(barberoServicioId);
      if (!barberoServicio || !barberoServicio.active) {
        throw ServerError.notFound("Servicio de barbero no encontrado o inactivo");
      }

      // Verifica que el servicio pertenezca al barbero
      if (barberoServicio.barbero._id.toString() !== barberoId) {
        throw ServerError.badRequest("El servicio no corresponde al barbero seleccionado");
      }

      const servicio = barberoServicio.servicio;

      // Verifica que el horario esté disponible
      const horariosDisponibles = await disponibilidadService.getHorariosDisponibles(
        barbero,
        fecha,
        servicio.duracion
      );
      if (!horariosDisponibles.includes(horaInicio)) {
        throw ServerError.conflict("El horario seleccionado no está disponible");
      }

      // Determina si el cliente es registrado o invitado
      let clienteId, clienteModel;

      if (req.user) {
        // Cliente registrado (tiene JWT)
        clienteId = req.user._id;
        clienteModel = "User";
      } else {
        // Cliente invitado — requiere nombre, email y teléfono
        if (!nombre || !email || !telefono) {
          throw ServerError.badRequest("Para reservar sin cuenta: nombre, email y teléfono son requeridos");
        }
        const existeComoUser = await authRepository.findByEmail(email);
        if (existeComoUser) {
          throw ServerError.conflict(
            "Ese email ya tiene una cuenta registrada. Iniciá sesión para reservar y acceder a tus beneficios."
          );
        }
        const invitado = await ClienteInvitado.create({ nombre, email, telefono });
        clienteId = invitado._id;
        clienteModel = "ClienteInvitado";
      }



      const fechaObj = new Date(fecha);

      const turno = await turnoRepository.create({
        barbero: barberoId,
        barberoServicio: barberoServicioId,
        cliente: clienteId,
        clienteModel,
        fecha: fechaObj,
        horaInicio,
        estado: "pendiente",
      });

      // Email de confirmación de reserva directa
      try {
        const clienteNombre = req.user?.name || nombre;
        const clienteEmail = req.user?.email || email;
        await emailService.sendConfirmacion({
          to: clienteEmail,
          nombre: clienteNombre,
          barberoNombre: barbero.user.name,
          servicio: servicio.nombre,
          fecha: fechaObj.toLocaleDateString("es-AR"),
          hora: horaInicio,
        });
      } catch (mailErr) {
        console.error("[EMAIL] Error enviando email de confirmación:", mailErr.message);
      }

      res.status(201).json(turno);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/turnos — admin ve todos
  async getAll(req, res, next) {
    try {
      const turnos = await turnoRepository.findAll();
      res.json(turnos);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/turnos/barbero/:id — agenda de un barbero
  async getByBarbero(req, res, next) {
    try {
      const turnos = await turnoRepository.findByBarbero(req.params.id);
      res.json(turnos);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/turnos/cliente/:id — historial del cliente
  async getByCliente(req, res, next) {
    try {
      const turnos = await turnoRepository.findByCliente(req.params.id);
      res.json(turnos);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/turnos/disponibilidad?barberoId=&servicioId=&fecha=
  async getDisponibilidad(req, res, next) {
    try {
      const { barberoId, servicioId, fecha } = req.query;
      if (!barberoId || !servicioId || !fecha) {
        throw ServerError.badRequest("barberoId, servicioId y fecha son requeridos");
      }

      const barbero = await barberoRepository.findById(barberoId);
      if (!barbero) throw ServerError.notFound("Barbero no encontrado");

      let servicio = await servicioRepository.findById(servicioId);
      if (!servicio) {
        // Intentar buscar como id de barberoServicio
        const relation = await barberoServicioRepository.findById(servicioId);
        if (relation) {
          servicio = relation.servicio;
        }
      }
      if (!servicio) throw ServerError.notFound("Servicio no encontrado");

      const horarios = await disponibilidadService.getHorariosDisponibles(
        barbero,
        fecha,
        servicio.duracion
      );

      res.json({ horarios });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/turnos/:id — cancelar turno (cliente cancela su propio turno)
  async cancelar(req, res, next) {
    try {
      const turno = await turnoRepository.findById(req.params.id);
      if (!turno) throw ServerError.notFound("Turno no encontrado");
      if (turno.estado === "cancelado" || turno.estado === "completado") {
        throw ServerError.badRequest("El turno ya fue cancelado o completado");
      }

      // Si está logueado, validar que sea su propio turno
      if (req.user) {
        if (turno.clienteModel !== "User" || turno.cliente._id.toString() !== req.user._id.toString()) {
          throw ServerError.forbidden("No tenés permiso para cancelar este turno");
        }
      }

      const ahora = new Date();

      await turnoRepository.updateById(turno._id, {
        estado: "cancelado",
        canceladoEn: ahora,
      });

      res.json({ message: "Turno cancelado exitosamente" });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/turnos/:id/completar — completar turno
  async completar(req, res, next) {
    try {
      const turno = await turnoRepository.findById(req.params.id);
      if (!turno) throw ServerError.notFound("Turno no encontrado");
      if (turno.estado !== "pendiente") {
        throw ServerError.badRequest("Solo se pueden completar turnos en estado pendiente");
      }

      const turnoActualizado = await turnoRepository.updateById(turno._id, {
        estado: "completado",
      });

      // Se eliminó el incremento de cortes ya que no existen beneficios de fidelidad

      res.json(turnoActualizado);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/turnos/barbero/:id/resumen-dia
  async resumenDia(req, res, next) {
    try {
      let { fecha } = req.query;
      if (!fecha) {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, "0");
        const dd = String(hoy.getDate()).padStart(2, "0");
        fecha = `${yyyy}-${mm}-${dd}`;
      }

      const turnos = await turnoRepository.findTurnosByBarberoYFecha(req.params.id, fecha);
      if (turnos.length === 0) {
        return res.json({ resumen: "No tenés turnos para este día." });
      }

      const d = new Date(fecha);
      const isPureDate = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
      const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
      if (isPureDate) {
        options.timeZone = "UTC";
      }
      const formattedFecha = d.toLocaleDateString("es-ES", options);

      const timeToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
      };

      const minutesToTime = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      };

      const lineasTurnos = turnos.map((t) => {
        const clienteNombre = t.cliente ? (t.cliente.name || t.cliente.nombre) : "Invitado";
        const servicioNombre = t.barberoServicio?.servicio ? t.barberoServicio.servicio.nombre : "Servicio Desconocido";
        const servicioDuracion = t.barberoServicio?.servicio ? t.barberoServicio.servicio.duracion : 0;
        return `${t.horaInicio} → ${clienteNombre} — ${servicioNombre} (${servicioDuracion} min) [${t.estado}]`;
      });

      const bachesAlerts = [];
      for (let i = 0; i < turnos.length - 1; i++) {
        const t1 = turnos[i];
        const t2 = turnos[i + 1];

        const t1Inicio = timeToMinutes(t1.horaInicio);
        const t1Duracion = t1.barberoServicio?.servicio ? t1.barberoServicio.servicio.duracion : 0;
        const t1Fin = t1Inicio + t1Duracion;

        const t2Inicio = timeToMinutes(t2.horaInicio);
        const dif = t2Inicio - t1Fin;

        if (dif >= 60) {
          const horaFinT1 = minutesToTime(t1Fin);
          const horaInicioT2 = t2.horaInicio;
          bachesAlerts.push(`⚠️ Bache libre de ${dif} minutos entre las ${horaFinT1} y las ${horaInicioT2}.`);
        }
      }

      const primerPendiente = turnos.find((t) => t.estado === "pendiente");

      let resumen = `Tenés ${turnos.length} turnos para el ${formattedFecha}.\n\n`;
      resumen += lineasTurnos.join("\n");

      if (bachesAlerts.length > 0) {
        resumen += "\n\n" + bachesAlerts.join("\n");
      }

      if (primerPendiente) {
        resumen += `\n\nTu próximo turno es a las ${primerPendiente.horaInicio}.`;
      }

      res.json({ resumen, turnos });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = turnoController;
