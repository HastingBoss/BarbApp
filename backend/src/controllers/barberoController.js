const barberoRepository = require("../repositories/barberoRepository");
const authRepository = require("../repositories/authRepository");
const ServerError = require("../utils/ServerError");
const bcrypt = require("bcrypt");
const turnoRepository = require("../repositories/turnoRepository");

const barberoController = {
  async getAll(req, res, next) {
    try {
      const barberos = await barberoRepository.findAll();
      res.json(barberos);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const barbero = await barberoRepository.findById(req.params.id);
      if (!barbero) throw ServerError.notFound("Barbero no encontrado");
      res.json(barbero);
    } catch (err) {
      next(err);
    }
  },

  // Obtener la agenda del barbero autenticado
  async getMiPerfil(req, res, next) {
    try {
      const barbero = await barberoRepository.findByUserId(req.user._id);
      if (!barbero) throw ServerError.notFound("Perfil de barbero no encontrado");
      res.json(barbero);
    } catch (err) {
      next(err);
    }
  },

  // Admin: crea user con role barbero + perfil Barbero
  async create(req, res, next) {
    try {
      const { name, email, password, servicios } = req.body;
      if (!name || !email || !password) {
        throw ServerError.badRequest("Nombre, email y contraseña son requeridos");
      }

      const existing = await authRepository.findByEmail(email);
      if (existing) throw ServerError.conflict("El email ya está registrado");

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await authRepository.create({
        name,
        email,
        password: hashedPassword,
        role: "barbero",
        emailVerified: true,
      });

      const barbero = await barberoRepository.create({
        user: user._id,
        servicios: servicios || [],
      });

      res.status(201).json(barbero);
    } catch (err) {
      next(err);
    }
  },

  async updateById(req, res, next) {
    try {
      const barbero = await barberoRepository.updateById(req.params.id, req.body);
      if (!barbero) throw ServerError.notFound("Barbero no encontrado");
      res.json(barbero);
    } catch (err) {
      next(err);
    }
  },

  // Admin asigna servicios a un barbero
  async updateServicios(req, res, next) {
    try {
      const { servicios } = req.body;
      if (!Array.isArray(servicios)) {
        throw ServerError.badRequest("servicios debe ser un array de IDs");
      }
      const barbero = await barberoRepository.updateServicios(req.params.id, servicios);
      if (!barbero) throw ServerError.notFound("Barbero no encontrado");
      res.json(barbero);
    } catch (err) {
      next(err);
    }
  },

  // Barberos que pueden hacer un servicio específico
  async getByServicio(req, res, next) {
    try {
      const barberos = await barberoRepository.findByServicio(req.params.servicioId);
      res.json(barberos);
    } catch (err) {
      next(err);
    }
  },

  async getMetricas(req, res, next) {
    try {
      let { desde, hasta } = req.query;
      if (!desde) {
        const ahora = new Date();
        desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
      }
      if (!hasta) {
        const ahora = new Date();
        hasta = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      }

      const turnos = await turnoRepository.findMetricasByBarbero(req.params.id, desde, hasta);
      const totalTurnos = turnos.length;
      let ingresoEstimado = 0;
      const serviciosMap = {};

      for (const t of turnos) {
        if (t.servicio) {
          ingresoEstimado += t.servicio.precio || 0;
          const nombreServicio = t.servicio.nombre;
          serviciosMap[nombreServicio] = (serviciosMap[nombreServicio] || 0) + 1;
        }
      }

      const turnosPorServicio = Object.entries(serviciosMap).map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
      }));

      res.json({
        totalTurnos,
        ingresoEstimado,
        turnosPorServicio,
        periodo: { desde, hasta },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = barberoController;
