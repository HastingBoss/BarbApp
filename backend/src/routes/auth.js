const { Router } = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe);
router.get("/verify-email", authController.verifyEmail);

module.exports = router;
