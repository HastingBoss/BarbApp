const { Router } = require("express");
const configController = require("../controllers/configController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = Router();

router.get("/", authenticate, authorize("admin"), configController.get);
router.put("/", authenticate, authorize("admin"), configController.update);

module.exports = router;
