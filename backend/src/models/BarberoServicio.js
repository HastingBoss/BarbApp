const mongoose = require("mongoose");

const barberoServicioSchema = new mongoose.Schema(
  {
    barbero: { type: mongoose.Schema.Types.ObjectId, ref: "Barbero", required: true },
    servicio: { type: mongoose.Schema.Types.ObjectId, ref: "Servicio", required: true },
    porcentaje: { type: Number, min: 0 }, // opcional, si no se define hereda % del salón

    duracion: { type: Number, min: 15 }, // opcional, si no se define hereda duracion de Servicio
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

barberoServicioSchema.index({ barbero: 1, servicio: 1 }, { unique: true });

module.exports = mongoose.model("BarberoServicio", barberoServicioSchema);
