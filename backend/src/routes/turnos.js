const { Router } = require("express");
const turnoController = require("../controllers/turnoController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = Router();

// Disponibilidad — público (necesario para el flujo de reserva)
router.get("/disponibilidad", turnoController.getDisponibilidad);

// Reservar — puede ser usuario autenticado o invitado (authenticate es opcional aquí)
// Se usa un middleware que intenta autenticar pero no falla si no hay token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next(); // invitado
  const jwt = require("jsonwebtoken");
  const authRepository = require("../repositories/authRepository");
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    authRepository.findById(decoded.id).then((user) => {
      req.user = user;
      next();
    });
  } catch {
    next(); // token inválido → pasa como invitado
  }
};

router.post("/", optionalAuth, turnoController.reservar);

// Admin — ve todos los turnos
router.get("/", authenticate, authorize("admin"), turnoController.getAll);

// Agenda de un barbero (admin o el propio barbero)
router.get(
  "/barbero/:id",
  authenticate,
  authorize("admin", "barbero"),
  turnoController.getByBarbero
);

// Resumen del día de un barbero (admin o el propio barbero)
router.get(
  "/barbero/:id/resumen-dia",
  authenticate,
  authorize("admin", "barbero"),
  turnoController.resumenDia
);

// Historial del cliente (admin o el propio cliente)
router.get(
  "/cliente/:id",
  authenticate,
  authorize("admin", "cliente"),
  turnoController.getByCliente
);



// Cancelar — cliente cancela su propio turno (mantiene optionalAuth)
router.delete("/:id", optionalAuth, turnoController.cancelar);

// Completar — admin o barbero pueden completar el turno
router.patch(
  "/:id/completar",
  authenticate,
  authorize("admin", "barbero"),
  turnoController.completar
);

module.exports = router;
