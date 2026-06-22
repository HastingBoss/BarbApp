const { Router } = require("express");
const barberoServicioController = require("../controllers/barberoServicioController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = Router();

// Public routes (used in ReservaWizard)
router.get("/barbero/:barberoId", barberoServicioController.getByBarbero);
router.get("/servicio/:servicioId", barberoServicioController.getByServicio);

// Admin routes
router.post("/", authenticate, authorize("admin"), barberoServicioController.create);
router.put("/:id", authenticate, authorize("admin"), barberoServicioController.updateById);
router.delete("/:id", authenticate, authorize("admin"), barberoServicioController.deleteById);

module.exports = router;
