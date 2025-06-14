const crearNotificacion = require('../funciones/notificaciones.functions');

function actualizarEstadoSolicitud(req, estado, res, db) {
  const { idRelacion } = req.body;
  const idBarbero = req.user.id;

  if (!idRelacion) {
    return res.status(400).json({ error: "Información insuficiente" });
  }
  
  const checkQuery = "SELECT * FROM Relaciones WHERE id = ? AND barbero_id = ? AND estado = 'pendiente'";
  const updateQuery = "UPDATE Relaciones SET estado = ? WHERE id = ? AND barbero_id = ?";

  db.query(checkQuery, [idRelacion, idBarbero], (err, results) => {
    
    if (err) {
      console.error(`Error al comprobar la solicitud (${estado}):`, err);
      return res.status(500).json({ error: "Error al comprobar la solicitud" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Solicitud no encontrada o ya procesada" });
    }

    db.query(updateQuery, [estado, idRelacion, idBarbero], (err, result) => {
      if (err) {
        console.error(`Error al actualizar solicitud (${estado}):`, err);
        return res.status(500).json({ error: `Error al actualizar solicitud (${estado})` });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Solicitud no encontrada o no tienes permiso para procesarla" });
      }

      res.status(200).json({ mensaje: `Solicitud ${estado}` });
      crearNotificacion({
        usuario_id: results[0].cliente_id,
        emisor_id: idBarbero,
        tipo: 'relacion',
        mensaje: estado
      });
    });
  });
}

function eliminarRelacion(req, res, db) {
  const { idRelacion } = req.body;
  const idBarbero = req.user.id;

  if (!idRelacion) {
    return res.status(400).json({ error: "Información insuficiente" });
  }
  const deleteQuery = "DELETE FROM Relaciones WHERE id = ? AND (barbero_id = ? OR cliente_id = ?)";

  db.query(deleteQuery, [idRelacion, idBarbero, idBarbero], (err, result) => {
    if (err) {
      console.error("Error al eliminar la relación:", err);
      return res.status(500).json({ error: "Error al eliminar la relación" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Relación no encontrada o no tienes permiso para eliminarla" });
    }

    res.status(200).json({ mensaje: "Relación eliminada correctamente" });
  });
}

module.exports = { actualizarEstadoSolicitud, eliminarRelacion };