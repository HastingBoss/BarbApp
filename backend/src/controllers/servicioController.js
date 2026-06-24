const servicioRepository = require("../repositories/servicioRepository");
const ServerError = require("../utils/ServerError");

const servicioController = {
  async getAll(req, res, next) {
    try {
      const servicios = await servicioRepository.findAll();
      res.json(servicios);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const servicio = await servicioRepository.findById(req.params.id);
      if (!servicio) throw ServerError.notFound("Servicio no encontrado");
      res.json(servicio);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { nombre, precioBase, precio, duracion } = req.body;
      const finalPrecioBase = precioBase !== undefined ? precioBase : precio;
      if (!nombre || finalPrecioBase == null || !duracion) {
        throw ServerError.badRequest("nombre, precioBase y duracion son requeridos");
      }
      const servicio = await servicioRepository.create({ nombre, precioBase: finalPrecioBase, duracion });
      res.status(201).json(servicio);
    } catch (err) {
      next(err);
    }
  },

  async updateById(req, res, next) {
    try {
      const servicio = await servicioRepository.updateById(req.params.id, req.body);
      if (!servicio) throw ServerError.notFound("Servicio no encontrado");
      res.json(servicio);
    } catch (err) {
      next(err);
    }
  },

  async deleteById(req, res, next) {
    try {
      const servicio = await servicioRepository.deleteById(req.params.id);
      if (!servicio) throw ServerError.notFound("Servicio no encontrado");
      res.json({ message: "Servicio desactivado" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = servicioController;
