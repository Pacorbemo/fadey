const { db } = require("../db/db.config");
const { emitirNotificacion } = require("../socket");
const enviarEmail = require("./email");

function crearNotificacion(
  { usuario_id, tipo, emisor_id = null, mensaje = null },
  callback
) {
  const query = `
    INSERT INTO notificaciones (usuario_id, emisor_id, mensaje, tipo)
    VALUES (?, ?, ?, ?)
  `;

  emitirNotificacion(usuario_id, tipo, emisor_id, mensaje);

  db.query(
    `SELECT 
        (SELECT username FROM Usuarios WHERE id = ?) AS emisor_username,
        (SELECT email FROM Usuarios WHERE id = ?) AS usuario_email,
        (SELECT email_verificado FROM Usuarios WHERE id = ?) AS email_verificado,
        (SELECT enviar_emails FROM Usuarios WHERE id = ?) AS enviar_emails
     `,
    [emisor_id, usuario_id, usuario_id, usuario_id],
    (err, results) => {
      if (err) {
        console.error("Error al obtener datos de usuarios:", err);
        return callback && callback(err);
      }
      if (!results || results.length === 0) {
        console.error("Usuarios no encontrados");
        return callback && callback(new Error("Usuarios no encontrados"));
      }

      const { emisor_username, usuario_email, email_verificado, enviar_emails } = results[0];

      if (!emisor_username || !usuario_email) {
        console.error("Datos de usuario incompletos");
        return callback && callback(new Error("Datos de usuario incompletos"));
      }

      if (!email_verificado || !enviar_emails) {
        return;
      }

      const username = emisor_username;
      const email = usuario_email;

      let mensajeEmail = "";
      switch (tipo) {
        case "mensaje":
          mensajeEmail = `Nuevo mensaje de ${username}`;
          break;
        case "cita":
          const fecha = new Date(mensaje);
          mensajeEmail = `Nueva cita de ${
            username
          } para ${fecha.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "2-digit",
          })} a las ${fecha.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
          break;
        case "producto":
          const msg = JSON.parse(mensaje);
          mensajeEmail = `${username} ha reservado ${msg.cantidad} ${msg.producto}`;
          break;
        case "solicitud":
          mensajeEmail = `${username} te ha enviado una solicitud de relación`;
          break;
        case "relacion":
          mensajeEmail = `${username} ha ${mensaje} tu solicitud`;
          break;
        default:
          return;
      }

      enviarEmail({
        to: email,
        subject: "Nueva Notificación",
        text: mensajeEmail,
      });
    }
  );


  db.query(query, [usuario_id, emisor_id, mensaje, tipo], (err, result) => {
    if (callback) return callback(err, result);
    if (err) {
      console.error("Error al crear notificación:", err);
    }
  });
}

module.exports = crearNotificacion;
