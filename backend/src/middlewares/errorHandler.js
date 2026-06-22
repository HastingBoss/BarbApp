const ServerError = require("../utils/ServerError");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }

  // Clave duplicada en Mongo (ej: email único)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `Ya existe un registro con ese ${field}` });
  }

  // Nuestro error personalizado
  if (err instanceof ServerError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Error genérico
  console.error("[ERROR]", err);
  return res.status(500).json({ error: "Error interno del servidor" });
};

module.exports = errorHandler;
