const mongoose = require("mongoose");

const servicioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    duracion: { type: Number, required: true, min: 15 }, // minutos
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Servicio", servicioSchema);
