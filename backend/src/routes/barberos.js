const { Router } = require("express");
const barberoController = require("../controllers/barberoController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = Router();

// Públicas (para el flujo de reserva)
router.get("/", barberoController.getAll);
router.get("/por-servicio/:servicioId", barberoController.getByServicio);
router.get("/:id", barberoController.getById);

// Barbero autenticado — su propio perfil
router.get("/me/perfil", authenticate, authorize("barbero"), barberoController.getMiPerfil);

// Admin
router.post("/", authenticate, authorize("admin"), barberoController.create);
router.put("/:id", authenticate, authorize("admin"), barberoController.updateById);
router.put("/:id/servicios", authenticate, authorize("admin"), barberoController.updateServicios);
router.get("/:id/metricas", authenticate, authorize("admin"), barberoController.getMetricas);

module.exports = router;
