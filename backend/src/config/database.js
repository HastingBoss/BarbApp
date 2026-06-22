const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[DB] Conectado a MongoDB");
  } catch (err) {
    console.error("[DB] Error de conexión:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
