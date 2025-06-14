const { db } = require('../db/db.config');

exports.crearNotificacion = (req, res) => {
  const { usuario_id, emisor_id, mensaje, tipo } = req.body;
  if (!usuario_id || !tipo) {
    return res.status(400).json({ error: "usuario_id y tipo son obligatorios" });
  }
  const query = `
    INSERT INTO notificaciones (usuario_id, emisor_id, mensaje, tipo)
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [usuario_id, emisor_id || null, mensaje || null, tipo], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error al crear notificación" });
    }
    res.status(201).json({ id: result.insertId });
  });
};

exports.obtenerNotificaciones = (req, res) => {
  const usuario_id = req.user.id;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const query = `
    SELECT n.*, u.username AS username
    FROM notificaciones n
    LEFT JOIN usuarios u ON n.emisor_id = u.id
    WHERE n.usuario_id = ?
    ORDER BY n.fecha DESC
    LIMIT ? OFFSET ?
  `;
  db.query(query, [usuario_id, limit, offset], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener notificaciones" });
    }
    res.json(
      results.map((notificacion) => ({
        username: notificacion.username,
        fecha: notificacion.fecha,
        leida: notificacion.leida,
        mensaje: notificacion.mensaje,
        tipo: notificacion.tipo,
      }))
    );
  });
};

exports.marcarLeida = (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE notificaciones SET leida = 1 WHERE id = ?",
    [id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Error al actualizar notificación" });
      }
      res.json({ success: true });
    }
  );
};

exports.marcarTodasLeidas = (req, res) => {
  const usuario_id = req.user.id;
  db.query(
    "UPDATE notificaciones SET leida = 1 WHERE usuario_id = ?",
    [usuario_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error al actualizar notificaciones" });
      }
      res.json({ success: true, updated: result.affectedRows });
    }
  );
};