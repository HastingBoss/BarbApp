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
  },
  { timestamps: true }
);

// Índice compuesto para evitar solapamiento de turnos por barbero
turnoSchema.index(
  { barbero: 1, fecha: 1, horaInicio: 1 },
  { unique: true, partialFilterExpression: { estado: "pendiente" } }
);

// Hook pre-save para evitar solapamientos de turnos
turnoSchema.pre("save", async function(next) {
  if (this.estado !== "pendiente") return next();

  try {
    const BarberoServicio = mongoose.model("BarberoServicio");
    const bServ = await BarberoServicio.findById(this.barberoServicio).populate("servicio");
    if (!bServ) {
      return next(new Error("Servicio de barbero no encontrado"));
    }

    const duracion = bServ.duracion || bServ.servicio?.duracion || 30;

    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const inicioNuevo = toMinutes(this.horaInicio);
    const finNuevo = inicioNuevo + duracion;

    const Turno = mongoose.model("Turno");
    const turnosExistentes = await Turno.find({
      barbero: this.barbero,
      fecha: this.fecha,
      estado: "pendiente",
      _id: { $ne: this._id }
    }).populate({
      path: "barberoServicio",
      populate: { path: "servicio" }
    });

    for (const t of turnosExistentes) {
      if (!t.barberoServicio) continue;
      const tDur = t.barberoServicio.duracion || t.barberoServicio.servicio?.duracion || 30;
      const inicioExistente = toMinutes(t.horaInicio);
      const finExistente = inicioExistente + tDur;

      if (inicioNuevo < finExistente && finNuevo > inicioExistente) {
        const err = new Error("El horario seleccionado se solapa con otro turno existente para este barbero.");
        err.status = 409;
        return next(err);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Turno", turnoSchema);

