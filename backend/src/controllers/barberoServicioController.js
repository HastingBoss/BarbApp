const barberoServicioRepository = require("../repositories/barberoServicioRepository");
const barberoRepository = require("../repositories/barberoRepository");
const ServerError = require("../utils/ServerError");

/**
 * Valida que el usuario autenticado tenga permisos sobre la relación barbero-servicio.
 * 
 * - Si es "admin", se autoriza sin restricciones.
 * - Si es "barbero", se verifica que el barbero en la relación (ya sea nueva o existente)
 *   coincida con su propio registro de barbero. En caso contrario, lanza un error 403.
 * 
 * @param {Object} req Objeto de petición Express conteniendo el usuario autenticado
 * @param {String} [barberoId] ID de barbero a asociar (para creaciones)
 * @param {String} [relationId] ID del registro BarberoServicio (para modificaciones)
 * @returns {Promise<String>} ID de barbero validado
 */
async function checkOwnership(req, barberoId, relationId) {
  if (req.user.role === "admin") return;

  if (req.user.role === "barbero") {
    const barbero = await barberoRepository.findByUserId(req.user._id);
    if (!barbero) {
      throw ServerError.forbidden("Perfil de barbero no encontrado");
    }

    if (barberoId) {
      if (barbero._id.toString() !== barberoId.toString()) {
        throw ServerError.forbidden("No tienes permiso para modificar los servicios de otro barbero");
      }
    } else if (relationId) {
      const relation = await barberoServicioRepository.findById(relationId);
      if (!relation) {
        throw ServerError.notFound("Relación barbero-servicio no encontrada");
      }
      const relBarberoId = relation.barbero._id || relation.barbero;
      if (barbero._id.toString() !== relBarberoId.toString()) {
        throw ServerError.forbidden("No tienes permiso para modificar los servicios de otro barbero");
      }
    }
    return barbero._id;
  }

  throw ServerError.forbidden("Acceso denegado");
}


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
      const porcentaje = req.body.porcentaje !== undefined ? req.body.porcentaje : req.body.precio;
      const duracion = req.body.duracion;
      if (!barbero || !servicio) {
        throw ServerError.badRequest("barbero y servicio son requeridos");
      }

      await checkOwnership(req, barbero, null);

      // Check if combination already exists (even if inactive, we retrieve it to potentially reactivate)
      // Note: findOne returns populated, let's look for active or inactive:
      const existing = await barberoServicioRepository.findOne(barbero, servicio);
      if (existing) {
        if (!existing.active) {
          const updated = await barberoServicioRepository.updateById(existing._id, { porcentaje, duracion, active: true });
          return res.status(200).json(updated);
        }
        throw ServerError.conflict("Esta combinación de barbero y servicio ya existe");
      }

      const relation = await barberoServicioRepository.create({ barbero, servicio, porcentaje, duracion });
      res.status(201).json(relation);
    } catch (err) {
      next(err);
    }
  },

  async updateById(req, res, next) {
    try {
      const { porcentaje, precio, duracion, active } = req.body;
      await checkOwnership(req, null, req.params.id);

      const finalPorcentaje = porcentaje !== undefined ? porcentaje : precio;
      const data = {};
      if (finalPorcentaje !== undefined) data.porcentaje = finalPorcentaje === "" ? null : finalPorcentaje;
      if (duracion !== undefined) data.duracion = duracion === "" ? null : duracion;
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
      await checkOwnership(req, null, req.params.id);

      const deleted = await barberoServicioRepository.deleteById(req.params.id);
      if (!deleted) throw ServerError.notFound("Relación barbero-servicio no encontrada");
      res.json({ message: "Relación eliminada exitosamente (soft delete)" });
    } catch (err) {
      next(err);
    }
  }

};

module.exports = barberoServicioController;

