const { Router } = require("express");
const configController = require("../controllers/configController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = Router();

// Endpoint público para que los clientes vean los precios correspondientes
router.get("/", configController.get);

// Solo Admin puede actualizar la configuración
router.put("/", authenticate, authorize("admin"), configController.update);

module.exports = router;
