const { db } = require('../db/db.config');
const crearNotificacion = require('../funciones/notificaciones.functions');
const { actualizarEstadoSolicitud, eliminarRelacion } = require('../funciones/relaciones');

exports.getRelaciones = (req, res) => {
  const idUsuario = req.user.id;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const query = `
    SELECT 
      Relaciones.id,
      Usuarios.username AS username,
      Usuarios.nombre AS nombre,
      Relaciones.estado,
      Relaciones.fecha_creacion
    FROM Relaciones
    JOIN Usuarios ON Relaciones.cliente_id = Usuarios.id
    WHERE Relaciones.barbero_id = ? OR Relaciones.cliente_id = ?
    LIMIT ? OFFSET ?;
  `;
  db.query(query, [idUsuario, idUsuario, limit, offset], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener relaciones" });
    }
    res.status(200).json(results);
  });
};

exports.getRelacionesCliente = (req, res) => {
  const idUsuario = req.user.id;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const query = `
    SELECT 
      Relaciones.id,
      Usuarios.username AS username,
      Usuarios.nombre AS nombre,
      Relaciones.estado,
      Relaciones.fecha_creacion
    FROM Relaciones
    JOIN Usuarios ON Relaciones.barbero_id = Usuarios.id
    WHERE Relaciones.cliente_id = ?
    LIMIT ? OFFSET ?;
  `;
  db.query(query, [idUsuario, limit, offset], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener relaciones" });
    }
    res.status(200).json(results);
  });
};

exports.getRelacionesBarbero = (req, res) => {
  const idUsuario = req.user.id;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const query = `
    SELECT 
      Relaciones.id,
      Usuarios.username AS username,
      Usuarios.nombre AS nombre,
      Relaciones.estado,
    FROM Relaciones
    JOIN Usuarios ON Relaciones.cliente_id = Usuarios.id
    WHERE Relaciones.barbero_id = ?
    LIMIT ? OFFSET ?;
  `;
  db.query(query, [idUsuario, limit, offset], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener relaciones" });
    }
    res.status(200).json(results);
  });
};

exports.getSolicitudes = (req, res) => {
  const idUsuario = req.user.id;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const query = `
    SELECT 
      Relaciones.id,
      Usuarios.username AS username,
      Usuarios.nombre AS nombre,
      Relaciones.estado,
      Relaciones.fecha_creacion
    FROM Relaciones
    JOIN Usuarios ON Relaciones.cliente_id = Usuarios.id
    WHERE Relaciones.barbero_id = ? AND Relaciones.estado = 'pendiente'
    LIMIT ? OFFSET ?;
  `;
  db.query(query, [idUsuario, limit, offset], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener solicitudes" });
    }
    res.status(200).json(results);
  });
}

exports.actualizarSolicitud = (req, res, estado) => {
  actualizarEstadoSolicitud(req, estado, res, db);
};

exports.eliminarRelacion = (req, res) => {
  eliminarRelacion(req, res, db);
};

exports.solicitarRelacion = (req, res) => {
  const { userBarbero } = req.body;
  const idCliente = req.user.id;
  if (!userBarbero) {
    return res.status(400).json({ error: "Información insuficiente" });
  }
  
  const idQuery = "SELECT id FROM Usuarios WHERE username = ?";
  const checkQuery = "SELECT * FROM Relaciones WHERE cliente_id = ? AND barbero_id = ?";
  const insertQuery = "INSERT INTO Relaciones (cliente_id, barbero_id, estado) VALUES (?, ?, 'pendiente')";
  
  db.query(idQuery, [userBarbero], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al buscar el barbero" });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: "Barbero no encontrado" });
    }
    const idBarbero = results[0].id;
    
    db.query(checkQuery, [idCliente, idBarbero], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error al comprobar la relación" });
      }
      if (results.length > 0) {
        return res.status(400).json({ error: "Ya has solicitado esta relación" });
      }
      db.query(insertQuery, [idCliente, idBarbero], (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Error al solicitar relación" });
        }
        res.status(200).json({ mensaje: "Solicitud enviada" });
        crearNotificacion({
          usuario_id: idBarbero,
          emisor_id: idCliente,
          tipo: 'solicitud',
          mensaje: ''
        });
      });
    });
  });
};

exports.comprobarRelacion = (req, res) => {
  const idBarbero = req.query.idBarbero;
  const idCliente = req.user.id;

  if (!idBarbero) {
    return res.status(400).json({ error: "ID de Barbero no proporcionado" });
  }

  const query = `
    SELECT * FROM Relaciones 
    WHERE cliente_id = ? AND barbero_id = ?
  `;
  db.query(query, [idCliente, idBarbero], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al comprobar la relación" });
    }

    if (results.length > 0) {
      res.status(200).json({ relacion: results[0].estado });
    } else {
      res.status(200).json({ relacion: 'ninguna' });
    }
  });
}