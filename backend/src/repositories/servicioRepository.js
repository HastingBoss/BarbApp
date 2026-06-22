const Servicio = require("../models/Servicio");

const servicioRepository = {
  async findAll() {
    return Servicio.find({ active: true });
  },

  async findById(id) {
    return Servicio.findById(id);
  },

  async create(data) {
    const servicio = new Servicio(data);
    return servicio.save();
  },

  async updateById(id, data) {
    return Servicio.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteById(id) {
    // Soft delete
    return Servicio.findByIdAndUpdate(id, { active: false }, { new: true });
  },
};

module.exports = servicioRepository;
