const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/database");
const errorHandler = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth");
const barberoRoutes = require("./routes/barberos");
const servicioRoutes = require("./routes/servicios");
const turnoRoutes = require("./routes/turnos");
const configRoutes = require("./routes/config");
const cronRoutes = require("./routes/cron");
const barberoServicioRoutes = require("./routes/barberoServicios");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/barberos", barberoRoutes);
app.use("/api/servicios", servicioRoutes);
app.use("/api/turnos", turnoRoutes);
app.use("/api/config", configRoutes);
app.use("/api/cron", cronRoutes);
app.use("/api/barbero-servicios", barberoServicioRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

connectDB();

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`[SERVER] Corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
