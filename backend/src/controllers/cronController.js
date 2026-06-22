const { enviarRecordatoriosHoy } = require("../services/cronService");

const cronController = {
  async recordatorios(req, res, next) {
    try {
      // Vercel firma las requests de cron con este header
      // En producción, rechazar cualquier llamada que no sea de Vercel
      const authHeader = req.headers["authorization"];
      if (
        process.env.NODE_ENV === "production" &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const resultado = await enviarRecordatoriosHoy();
      res.json({ ok: true, ...resultado });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = cronController;
