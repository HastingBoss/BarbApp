const mongoose = require("mongoose");

const turnoSchema = new mongoose.Schema(
  {
    barbero: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barbero",
      required: true,
    },
    barberoServicio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BarberoServicio",
      required: true,
    },
    // cliente puede ser un User registrado o un ClienteInvitado
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "clienteModel",
    },
    clienteModel: {
      type: String,
      enum: ["User", "ClienteInvitado"],
    },
    fecha: { type: Date, required: true },       // solo la fecha (sin hora)
    horaInicio: { type: String, required: true }, // "HH:mm"
    estado: {
      type: String,
      enum: ["pendiente", "cancelado", "completado"],
      default: "pendiente",
    },
    canceladoEn: { type: Date },
    recordatorioEnviado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Índice compuesto para evitar solapamiento de turnos por barbero
turnoSchema.index(
  { barbero: 1, fecha: 1, horaInicio: 1 },
  { unique: true, partialFilterExpression: { estado: "pendiente" } }
);

module.exports = mongoose.model("Turno", turnoSchema);
