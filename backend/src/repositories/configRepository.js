const Config = require("../models/Config");

const configRepository = {
  async getConfig() {
    let config = await Config.findOne();
    if (!config) {
      config = new Config();
      await config.save();
    }
    return config;
  },

  async updateConfig(data) {
    let config = await Config.findOne();
    if (!config) {
      config = new Config(data);
    } else {
      Object.assign(config, data);
    }
    return config.save();
  },
};

module.exports = configRepository;
