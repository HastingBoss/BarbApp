const barberoServicioRepository = require("../repositories/barberoServicioRepository");
const ServerError = require("../utils/ServerError");

const barberoServicioController = {
  async getAll(req, res, next) {
    try {
      const relations = await barberoServicioRepository.findAll();
      res.json(relations);
    } catch (err) {
      next(err);
    }
  },

  async getByBarbero(req, res, next) {
    try {
      const relations = await barberoServicioRepository.findByBarbero(req.params.barberoId);
      res.json(relations);
    } catch (err) {
      next(err);
    }
  },

  async getByServicio(req, res, next) {
    try {
      const relations = await barberoServicioRepository.findByServicio(req.params.servicioId);
      res.json(relations);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const barbero = req.body.barbero || req.body.barberoId;
      const servicio = req.body.servicio || req.body.servicioId;
      const precio = req.body.precio;
      if (!barbero || !servicio || precio === undefined) {
        throw ServerError.badRequest("barbero, servicio y precio son requeridos");
      }

      // Check if combination already exists
      const existing = await barberoServicioRepository.findOne(barbero, servicio);
      if (existing) {
        // If it exists but is inactive, reactivate it and update price
        if (!existing.active) {
          const updated = await barberoServicioRepository.updateById(existing._id, { precio, active: true });
          return res.status(200).json(updated);
        }
        throw ServerError.conflict("Esta combinación de barbero y servicio ya existe");
      }

      const relation = await barberoServicioRepository.create({ barbero, servicio, precio });
      res.status(201).json(relation);
    } catch (err) {
      next(err);
    }
  },

  async updateById(req, res, next) {
    try {
      const { precio, active } = req.body;
      const data = {};
      if (precio !== undefined) data.precio = precio;
      if (active !== undefined) data.active = active;

      const updated = await barberoServicioRepository.updateById(req.params.id, data);
      if (!updated) throw ServerError.notFound("Relación barbero-servicio no encontrada");
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteById(req, res, next) {
    try {
      const deleted = await barberoServicioRepository.deleteById(req.params.id);
      if (!deleted) throw ServerError.notFound("Relación barbero-servicio no encontrada");
      res.json({ message: "Relación eliminada exitosamente (soft delete)" });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = barberoServicioController;
