const Barbero = require("../models/Barbero");
const BarberoServicio = require("../models/BarberoServicio");

const configRepository = require("./configRepository");

async function attachRelationsToBarbero(barbero) {
  if (!barbero) return null;
  
  const config = await configRepository.getConfig();
  const porcentaje = config.porcentajeSalon || 0;

  // Attach services
  const docs = await BarberoServicio.find({ barbero: barbero._id, active: true }).populate("servicio");
  const servicios = docs.map(d => {
    if (!d.servicio) return null;
    
    const base = d.servicio.precioBase || 0;
    const finalPrecio = d.precio !== undefined && d.precio !== null 
      ? d.precio 
      : Math.round(base * (1 + porcentaje / 100) * 100) / 100;
      
    const finalDuracion = d.duracion || d.servicio.duracion || 0;

    return {
      _id: d.servicio._id,
      nombre: d.servicio.nombre,
      duracion: finalDuracion,
      precio: finalPrecio,
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
