const { Router } = require("express");
const cronController = require("../controllers/cronController");

const router = Router();

// Invocado por Vercel Cron Jobs al horario de apertura configurado
// También puede llamarse manualmente desde el dashboard de admin
router.get("/recordatorios", cronController.recordatorios);

module.exports = router;
