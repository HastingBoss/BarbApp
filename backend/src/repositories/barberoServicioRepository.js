const BarberoServicio = require("../models/BarberoServicio");
const { calculateDynamicFields } = require("../utils/precioHelper");

const barberoServicioRepository = {
  async findById(id) {
    const doc = await BarberoServicio.findById(id)
      .populate({ path: "barbero", populate: { path: "user", select: "name email" } })
      .populate("servicio");
    return calculateDynamicFields(doc);
  },

  async findByBarbero(barberoId) {
    const docs = await BarberoServicio.find({ barbero: barberoId, active: true })
      .populate("servicio");
    return Promise.all(docs.map(doc => calculateDynamicFields(doc)));
  },

  async findByServicio(servicioId) {
    const docs = await BarberoServicio.find({ servicio: servicioId, active: true })
      .populate({ path: "barbero", populate: { path: "user", select: "name email" } })
      .populate("servicio");
    return Promise.all(docs.map(doc => calculateDynamicFields(doc)));
  },

  async findOne(barberoId, servicioId) {
    const doc = await BarberoServicio.findOne({ barbero: barberoId, servicio: servicioId, active: true })
      .populate("servicio");
    return calculateDynamicFields(doc);
  },

  async create(data) {
    const relation = new BarberoServicio(data);
    const saved = await relation.save();
    return this.findById(saved._id);
  },

  async updateById(id, data) {
    const updated = await BarberoServicio.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return null;
    return this.findById(updated._id);
  },

  async deleteById(id) {
    // Soft delete
    const deleted = await BarberoServicio.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!deleted) return null;
    return this.findById(deleted._id);
  },

  async findAll() {
    const docs = await BarberoServicio.find({ active: true })
      .populate({ path: "barbero", populate: { path: "user", select: "name email" } })
      .populate("servicio");
    return Promise.all(docs.map(doc => calculateDynamicFields(doc)));
  }
};


module.exports = barberoServicioRepository;
