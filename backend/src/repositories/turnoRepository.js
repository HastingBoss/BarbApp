const Turno = require("../models/Turno");
const { calculateDynamicTurno } = require("../utils/precioHelper");

const turnoRepository = {
  async create(data) {
    const turno = new Turno(data);
    const saved = await turno.save();
    return this.findById(saved._id);
  },

  async findById(id) {
    const doc = await Turno.findById(id)
      .populate({ path: "barbero", populate: { path: "user", select: "name email" } })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente");
    return calculateDynamicTurno(doc);
  },

  // Turnos de un barbero en una fecha específica (para calcular disponibilidad)
  async findByBarberoAndFecha(barberoId, fecha) {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    const docs = await Turno.find({
      barbero: barberoId,
      fecha: { $gte: inicio, $lte: fin },
      estado: { $in: ["pendiente", "completado"] },
    }).populate({ path: "barberoServicio", populate: { path: "servicio" } });
    return Promise.all(docs.map(doc => calculateDynamicTurno(doc)));
  },

  // Todos los turnos (admin)
  async findAll(filters = {}) {
    const docs = await Turno.find(filters)
      .populate({ path: "barbero", populate: { path: "user", select: "name" } })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente")
      .sort({ fecha: 1, horaInicio: 1 });
    return Promise.all(docs.map(doc => calculateDynamicTurno(doc)));
  },

  // Turnos de un barbero (su agenda)
  async findByBarbero(barberoId) {
    const docs = await Turno.find({ barbero: barberoId })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente")
      .sort({ fecha: 1, horaInicio: 1 });
    return Promise.all(docs.map(doc => calculateDynamicTurno(doc)));
  },

  // Turnos pendientes de confirmación para un barbero
  async findPendientesByBarbero(barberoId) {
    const docs = await Turno.find({ barbero: barberoId, estado: "pendiente" })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente")
      .sort({ fecha: 1, horaInicio: 1 });
    return Promise.all(docs.map(doc => calculateDynamicTurno(doc)));
  },

  // Turnos de un cliente registrado
  async findByCliente(clienteId) {
    const docs = await Turno.find({ cliente: clienteId, clienteModel: "User" })
      .populate({ path: "barbero", populate: { path: "user", select: "name" } })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .sort({ fecha: -1 });
    return Promise.all(docs.map(doc => calculateDynamicTurno(doc)));
  },

  async findMetricasByBarbero(barberoId, desde, hasta) {
    const inicio = new Date(desde);
    const fin = new Date(hasta);
    const docs = await Turno.find({
      barbero: barberoId,
      estado: "completado",
      fecha: { $gte: inicio, $lte: fin },
    }).populate({ path: "barberoServicio", populate: { path: "servicio" } });
    return Promise.all(docs.map(doc => calculateDynamicTurno(doc)));
  },

  async findTurnosByBarberoYFecha(barberoId, fecha) {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    const docs = await Turno.find({
      barbero: barberoId,
      fecha: { $gte: inicio, $lte: fin },
      estado: { $in: ["pendiente", "completado"] },
    })
      .populate({ path: "barberoServicio", populate: { path: "servicio" } })
      .populate("cliente", "name nombre")
      .sort({ horaInicio: 1 });
    return Promise.all(docs.map(doc => calculateDynamicTurno(doc)));
  },

  async updateById(id, data) {
    const updated = await Turno.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return null;
    return this.findById(updated._id);
  },
};


module.exports = turnoRepository;
