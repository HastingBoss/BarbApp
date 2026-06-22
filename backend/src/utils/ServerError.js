class ServerError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ServerError";
  }

  static badRequest(msg) {
    return new ServerError(msg, 400);
  }

  static unauthorized(msg = "No autorizado") {
    return new ServerError(msg, 401);
  }

  static forbidden(msg = "Acceso denegado") {
    return new ServerError(msg, 403);
  }

  static notFound(msg = "Recurso no encontrado") {
    return new ServerError(msg, 404);
  }

  static conflict(msg) {
    return new ServerError(msg, 409);
  }
}

module.exports = ServerError;
