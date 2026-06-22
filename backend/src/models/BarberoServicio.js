const mongoose = require("mongoose");

const barberoServicioSchema = new mongoose.Schema(
  {
    barbero: { type: mongoose.Schema.Types.ObjectId, ref: "Barbero", required: true },
    servicio: { type: mongoose.Schema.Types.ObjectId, ref: "Servicio", required: true },
    precio: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

barberoServicioSchema.index({ barbero: 1, servicio: 1 }, { unique: true });

module.exports = mongoose.model("BarberoServicio", barberoServicioSchema);
