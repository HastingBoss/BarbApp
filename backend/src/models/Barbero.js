const mongoose = require("mongoose");

const barberoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    active: { type: Boolean, default: true },
    horarios: [
      {
        dia: {
          type: String,
          enum: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
          required: true,
        },
        horaInicio: { type: String, required: true },
        horaFin: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Barbero", barberoSchema);
