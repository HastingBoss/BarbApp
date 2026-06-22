const { Router } = require("express");
const servicioController = require("../controllers/servicioController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = Router();

router.get("/", servicioController.getAll);
router.get("/:id", servicioController.getById);

router.post("/", authenticate, authorize("admin"), servicioController.create);
router.put("/:id", authenticate, authorize("admin"), servicioController.updateById);
router.delete("/:id", authenticate, authorize("admin"), servicioController.deleteById);

module.exports = router;
