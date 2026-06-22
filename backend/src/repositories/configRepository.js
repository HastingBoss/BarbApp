const Config = require("../models/Config");

const configRepository = {
  // Obtiene el singleton, lo crea si no existe
  async get() {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({});
    }
    return config;
  },

  async update(data) {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create(data);
      return config;
    }
    return Config.findByIdAndUpdate(config._id, data, { new: true });
  },
};

module.exports = configRepository;
