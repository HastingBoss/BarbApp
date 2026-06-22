const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/authRepository");
const ServerError = require("../utils/ServerError");
const { generateEmailToken } = require("../utils/token");
const emailService = require("../services/emailService");

const SALT_ROUNDS = 10;

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        throw ServerError.badRequest("Nombre, email y contraseña son requeridos");
      }

      const existing = await authRepository.findByEmail(email);
      if (existing) throw ServerError.conflict("El email ya está registrado");

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await authRepository.create({
        name,
        email,
        password: hashedPassword,
        role: "cliente",
      });

      const token = generateToken(user._id);

      // Generar token y enviar email de verificación
      try {
        const emailToken = generateEmailToken(user.email);
        await emailService.sendVerificacion({
          to: user.email,
          nombre: user.name,
          token: emailToken,
        });
      } catch (emailErr) {
        console.error("[EMAIL] Error enviando verificación:", emailErr.message);
      }

      res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw ServerError.badRequest("Email y contraseña son requeridos");
      }

      const user = await authRepository.findByEmail(email);
      if (!user) throw ServerError.unauthorized("Credenciales inválidas");

      const match = await bcrypt.compare(password, user.password);
      if (!match) throw ServerError.unauthorized("Credenciales inválidas");

      if (!user.emailVerified) {
        throw ServerError.unauthorized("Verificá tu email antes de iniciar sesión");
      }

      const token = generateToken(user._id);
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res) {
    res.json({ user: req.user });
  },

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      if (!token) {
        throw ServerError.badRequest("Token es requerido");
      }

      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        throw ServerError.badRequest("Token inválido o expirado");
      }

      if (payload.purpose !== "email-verification" || !payload.email) {
        throw ServerError.badRequest("Token inválido");
      }

      const user = await authRepository.findByEmail(payload.email);
      if (!user) {
        throw ServerError.notFound("Usuario no encontrado");
      }

      await authRepository.updateById(user._id, { emailVerified: true });

      res.json({ message: "Email verificado" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
