const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    horaRecordatorio: { type: String, default: "09:00" }, // "HH:mm"
  },
  { timestamps: true }
);

// Solo debe existir un documento de configuración (singleton)
const Config = mongoose.model("Config", configSchema);

module.exports = Config;
