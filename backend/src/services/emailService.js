const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const emailService = {
  async sendConfirmacion({ to, nombre, barberoNombre, servicio, fecha, hora }) {
    await transporter.sendMail({
      from: `"Barbería" <${process.env.MAIL_USER}>`,
      to,
      subject: "✅ Turno confirmado",
      html: `
        <div style="background-color: #0f0f1a; padding: 40px 10px; font-family: sans-serif; min-height: 100%;">
          <div style="max-width: 480px; margin: 0 auto; background-color: #16213e; border-radius: 12px; padding: 32px; box-sizing: border-box;">
            <div style="color: #c9a84c; font-size: 24px; text-align: center; margin-bottom: 24px; font-weight: bold; letter-spacing: 2px;">BARBERÍA</div>
            <div style="color: #ffffff; font-size: 18px; font-weight: bold; margin-bottom: 12px;">¡Hola ${nombre}!</div>
            <div style="color: #a0a0b0; font-size: 14px; margin-bottom: 20px;">Tu turno fue confirmado exitosamente.</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #2a2a4a;">
                <td style="padding: 10px 0; color: #c9a84c; font-weight: bold; width: 40%; font-size: 14px;">Servicio</td>
                <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${servicio}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2a2a4a;">
                <td style="padding: 10px 0; color: #c9a84c; font-weight: bold; width: 40%; font-size: 14px;">Barbero</td>
                <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${barberoNombre}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2a2a4a;">
                <td style="padding: 10px 0; color: #c9a84c; font-weight: bold; width: 40%; font-size: 14px;">Fecha</td>
                <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${fecha}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2a2a4a;">
                <td style="padding: 10px 0; color: #c9a84c; font-weight: bold; width: 40%; font-size: 14px;">Hora</td>
                <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${hora}</td>
              </tr>
            </table>
            <div style="color: #a0a0b0; font-size: 13px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #2a2a4a;">
              Si necesitás cancelar, por favor hacelo con anticipación.
            </div>
          </div>
        </div>
      `,
    });
  },

  async sendRecordatorio({ to, nombre, barberoNombre, servicio, fecha, hora }) {
    await transporter.sendMail({
      from: `"Barbería" <${process.env.MAIL_USER}>`,
      to,
      subject: "⏰ Recordatorio de turno — mañana",
      html: `
        <div style="background-color: #0f0f1a; padding: 40px 10px; font-family: sans-serif; min-height: 100%;">
          <div style="max-width: 480px; margin: 0 auto; background-color: #16213e; border-radius: 12px; padding: 32px; box-sizing: border-box;">
            <div style="color: #c9a84c; font-size: 24px; text-align: center; margin-bottom: 24px; font-weight: bold; letter-spacing: 2px;">BARBERÍA</div>
            <div style="color: #ffffff; font-size: 18px; font-weight: bold; margin-bottom: 12px;">¡Hola ${nombre}!</div>
            <div style="color: #a0a0b0; font-size: 14px; margin-bottom: 20px;">Te recordamos que mañana tenés un turno.</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #2a2a4a;">
                <td style="padding: 10px 0; color: #c9a84c; font-weight: bold; width: 40%; font-size: 14px;">Servicio</td>
                <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${servicio}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2a2a4a;">
                <td style="padding: 10px 0; color: #c9a84c; font-weight: bold; width: 40%; font-size: 14px;">Barbero</td>
                <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${barberoNombre}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2a2a4a;">
                <td style="padding: 10px 0; color: #c9a84c; font-weight: bold; width: 40%; font-size: 14px;">Fecha</td>
                <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${fecha}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2a2a4a;">
                <td style="padding: 10px 0; color: #c9a84c; font-weight: bold; width: 40%; font-size: 14px;">Hora</td>
                <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${hora}</td>
              </tr>
            </table>
            <div style="color: #a0a0b0; font-size: 13px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #2a2a4a;">
              ¡Te esperamos!
            </div>
          </div>
        </div>
      `,
    });
  },

  async sendVerificacion({ to, nombre, token }) {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await transporter.sendMail({
      from: `"Barbería" <${process.env.MAIL_USER}>`,
      to,
      subject: "📧 Verifica tu cuenta de correo",
      html: `
        <h2>¡Hola ${nombre}!</h2>
        <p>Gracias por registrarte. Por favor, verifica tu cuenta haciendo clic en el siguiente enlace:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Este enlace expirará en 24 horas.</p>
      `,
    });
  },
};

module.exports = emailService;
