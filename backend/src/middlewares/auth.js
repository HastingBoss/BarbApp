const jwt = require("jsonwebtoken");
const ServerError = require("../utils/ServerError");
const authRepository = require("../repositories/authRepository");

// Verifica que el token JWT sea válido y adjunta el user al request
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw ServerError.unauthorized("Token no proporcionado");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await authRepository.findById(decoded.id);
    if (!user) throw ServerError.unauthorized("Usuario no encontrado");

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(ServerError.unauthorized("Token inválido o expirado"));
    }
    next(err);
  }
};

// Función de alto orden: verifica que el usuario tenga uno de los roles permitidos
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(ServerError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ServerError.forbidden("No tenés permisos para esta acción"));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
