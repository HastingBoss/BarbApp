const configRepository = require("../repositories/configRepository");
const ServerError = require("../utils/ServerError");

const configController = {
  async get(req, res, next) {
    try {
      const config = await configRepository.get();
      res.json(config);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { horaRecordatorio } = req.body;
      const data = {};

      if (horaRecordatorio) {
        if (!/^\d{2}:\d{2}$/.test(horaRecordatorio)) {
          throw ServerError.badRequest("horaRecordatorio debe tener formato HH:mm");
        }
        data.horaRecordatorio = horaRecordatorio;
      }

      const config = await configRepository.update(data);
      res.json(config);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = configController;
