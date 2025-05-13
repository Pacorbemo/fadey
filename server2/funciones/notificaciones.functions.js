const { db } = require('../db/db.config');

function crearNotificacion({ usuario_id, tipo, emisor_id = null, mensaje = null }, callback) {
  const query = `
    INSERT INTO notificaciones (usuario_id, emisor_id, mensaje, tipo)
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [usuario_id, emisor_id, mensaje, tipo], (err, result) => {
    if (callback) return callback(err, result);
    if (err) {
      console.error('Error al crear notificación:', err);
    }
  });
}

module.exports = crearNotificacion;