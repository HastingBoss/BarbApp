const Barbero = require("../models/Barbero");
const BarberoServicio = require("../models/BarberoServicio");

async function attachRelationsToBarbero(barbero) {
  if (!barbero) return null;
  
  // Attach services
  const docs = await BarberoServicio.find({ barbero: barbero._id, active: true }).populate("servicio");
  const servicios = docs.map(d => {
    if (!d.servicio) return null;
    return {
      _id: d.servicio._id,
      nombre: d.servicio.nombre,
      duracion: d.servicio.duracion,
      precio: d.precio,
      barberoServicioId: d._id
    };
  }).filter(Boolean);

  const obj = barbero.toObject ? barbero.toObject() : barbero;
  obj.servicios = servicios;
  return obj;
}

const barberoRepository = {
  async findAll() {
    const barberos = await Barbero.find({ active: true })
      .populate("user", "name email");
    return Promise.all(barberos.map(b => attachRelationsToBarbero(b)));
  },

  async findById(id) {
    const barbero = await Barbero.findById(id)
      .populate("user", "name email");
    return attachRelationsToBarbero(barbero);
  },

  async findByUserId(userId) {
    const barbero = await Barbero.findOne({ user: userId })
      .populate("user", "name email");
    return attachRelationsToBarbero(barbero);
  },

  // Barberos que tienen asignado un servicio específico
  async findByServicio(servicioId) {
    return this.findByServicioId(servicioId);
  },

  async findByServicioId(servicioId) {
    const barberoServicioRepository = require("./barberoServicioRepository");
    const relations = await barberoServicioRepository.findByServicio(servicioId);
    const list = relations.map(r => r.barbero).filter(b => b && b.active);
    return Promise.all(list.map(b => attachRelationsToBarbero(b)));
  },

  async create(data) {
    const barbero = new Barbero(data);
    return barbero.save();
  },

  async updateById(id, data) {
    const barbero = await Barbero.findByIdAndUpdate(id, data, { new: true })
      .populate("user", "name email");
    return attachRelationsToBarbero(barbero);
  },

  async updateServicios(id, servicios) {
    // Deprecated but return updated barbero for compatibility
    return this.findById(id);
  },
};

module.exports = barberoRepository;
