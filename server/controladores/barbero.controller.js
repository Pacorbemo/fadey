const { db } = require("../db/db.config");

exports.esBarbero = (req, res) => {
  const { id } = req.params;
  const query = "SELECT barbero FROM Usuarios WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al buscar usuario:", err);
      return res.status(500).json({ error: "Error al buscar el usuario" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json(results[0]);
  });
};

exports.buscarBarberos = (req, res) => {
  const { query } = req.params;
  if (!query) {
    return res.status(400).json({ error: "Falta el parámetro de búsqueda" });
  }
  const sql = `
    SELECT id, username, nombre, foto_perfil 
    FROM Usuarios 
    WHERE barbero = 1 AND (username LIKE ? OR nombre LIKE ?) 
    LIMIT 10
  `;
  db.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
    if (err) {
      console.error("Error al buscar barberos:", err);
      return res.status(500).json({ error: "Error al buscar barberos" });
    }
    res.status(200).json(results);
  });
};

exports.randomBarberos = (req, res) => {
  const sql = `
    SELECT id, username, nombre, foto_perfil 
    FROM Usuarios 
    WHERE barbero = 1 
    ORDER BY RAND() 
    LIMIT 10
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener barberos aleatorios:", err);
      return res
        .status(500)
        .json({ error: "Error al obtener barberos aleatorios" });
    }
    res.status(200).json(results);
  });
};

exports.getProductosBarbero = (req, res) => {
  const { username } = req.params;
  const query = `
    SELECT Productos.id, Productos.nombre, Productos.precio, Productos.descripcion, Productos.foto, Productos.stock 
    FROM Productos 
    JOIN Usuarios ON Productos.barbero_id = Usuarios.id 
    WHERE Usuarios.username = ?
  `;
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error al obtener productos:", err);
      return res.status(500).json({ error: "Error al obtener productos" });
    }
    res.status(200).json(results);
  });
};
