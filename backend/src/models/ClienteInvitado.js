const mongoose = require("mongoose");

const clienteInvitadoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    telefono: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClienteInvitado", clienteInvitadoSchema);
