const configRepository = require("../repositories/configRepository");

const configController = {
  async get(req, res, next) {
    try {
      const config = await configRepository.getConfig();
      res.json(config);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { porcentajeSalon } = req.body;
      const parsedPorcentaje = Number(porcentajeSalon);
      if (isNaN(parsedPorcentaje) || parsedPorcentaje < 0) {
        return res.status(400).json({ error: "porcentajeSalon debe ser un número válido mayor o igual a 0" });
      }

      const config = await configRepository.updateConfig({ porcentajeSalon: parsedPorcentaje });
      res.json(config);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = configController;
