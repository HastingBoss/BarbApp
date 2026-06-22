const BarberoServicio = require("../models/BarberoServicio");

const barberoServicioRepository = {
  async findById(id) {
    return BarberoServicio.findById(id)
      .populate({ path: "barbero", populate: { path: "user", select: "name email" } })
      .populate("servicio");
  },

  async findByBarbero(barberoId) {
    return BarberoServicio.find({ barbero: barberoId, active: true })
      .populate("servicio", "nombre duracion");
  },

  async findByServicio(servicioId) {
    return BarberoServicio.find({ servicio: servicioId, active: true })
      .populate({ path: "barbero", populate: { path: "user", select: "name email" } });
  },

  async findOne(barberoId, servicioId) {
    return BarberoServicio.findOne({ barbero: barberoId, servicio: servicioId, active: true })
      .populate("servicio");
  },

  async create(data) {
    const relation = new BarberoServicio(data);
    return relation.save();
  },

  async updateById(id, data) {
    return BarberoServicio.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteById(id) {
    // Soft delete
    return BarberoServicio.findByIdAndUpdate(id, { active: false }, { new: true });
  },

  async findAll() {
    return BarberoServicio.find({ active: true })
      .populate({ path: "barbero", populate: { path: "user", select: "name email" } })
      .populate("servicio");
  }
};

module.exports = barberoServicioRepository;
