const Turno = require("../models/Turno");

const turnoRepository = {
  async create(data) {
    const turno = new Turno(data);
    return turno.save();
  },

  async findById(id) {
    return Turno.findById(id)
      .populate({ path: "barbero", populate: { path: "user", select: "name email" } })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente");
  },

  // Turnos de un barbero en una fecha específica (para calcular disponibilidad)
  async findByBarberoAndFecha(barberoId, fecha) {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    return Turno.find({
      barbero: barberoId,
      fecha: { $gte: inicio, $lte: fin },
      estado: { $in: ["pendiente", "completado"] },
    }).populate({ path: "barberoServicio", populate: { path: "servicio" } });
  },

  // Todos los turnos (admin)
  async findAll(filters = {}) {
    return Turno.find(filters)
      .populate({ path: "barbero", populate: { path: "user", select: "name" } })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente")
      .sort({ fecha: 1, horaInicio: 1 });
  },

  // Turnos de un barbero (su agenda)
  async findByBarbero(barberoId) {
    return Turno.find({ barbero: barberoId })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente")
      .sort({ fecha: 1, horaInicio: 1 });
  },

  // Turnos pendientes de confirmación para un barbero
  async findPendientesByBarbero(barberoId) {
    return Turno.find({ barbero: barberoId, estado: "pendiente" })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente")
      .sort({ fecha: 1, horaInicio: 1 });
  },

  // Turnos de un cliente registrado
  async findByCliente(clienteId) {
    return Turno.find({ cliente: clienteId, clienteModel: "User" })
      .populate({ path: "barbero", populate: { path: "user", select: "name" } })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .sort({ fecha: -1 });
  },

  // Turnos de hoy para enviar recordatorios al horario de apertura
  async findTurnosHoy() {
    const hoy = new Date();
    const inicioDia = new Date(hoy);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(hoy);
    finDia.setHours(23, 59, 59, 999);

    return Turno.find({
      fecha: { $gte: inicioDia, $lte: finDia },
      estado: "pendiente",
      recordatorioEnviado: false,
    })
      .populate({ path: "barbero", populate: { path: "user", select: "name" } })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente");
  },

  async findMetricasByBarbero(barberoId, desde, hasta) {
    const inicio = new Date(desde);
    const fin = new Date(hasta);
    return Turno.find({
      barbero: barberoId,
      estado: "completado",
      fecha: { $gte: inicio, $lte: fin },
    }).populate({ path: "barberoServicio", populate: { path: "servicio" } });
  },

  async findTurnosByBarberoYFecha(barberoId, fecha) {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    return Turno.find({
      barbero: barberoId,
      fecha: { $gte: inicio, $lte: fin },
      estado: { $in: ["pendiente", "completado"] },
    })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente", "name nombre")
      .sort({ horaInicio: 1 });
  },

  async updateById(id, data) {
    return Turno.findByIdAndUpdate(id, data, { new: true });
  },
};

module.exports = turnoRepository;
