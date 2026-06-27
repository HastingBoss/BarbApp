const { Router } = require("express");
const barberoServicioController = require("../controllers/barberoServicioController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = Router();

// Public routes (used in ReservaWizard)
router.get("/barbero/:barberoId", barberoServicioController.getByBarbero);
router.get("/servicio/:servicioId", barberoServicioController.getByServicio);

// Admin and Barbero routes
router.post("/", authenticate, authorize("admin", "barbero"), barberoServicioController.create);
router.put("/:id", authenticate, authorize("admin", "barbero"), barberoServicioController.updateById);
router.delete("/:id", authenticate, authorize("admin", "barbero"), barberoServicioController.deleteById);


module.exports = router;
