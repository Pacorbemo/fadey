const { db } = require("../db/db.config");

exports.usuarioExiste = (req, res) => {
	const { username } = req.params;

  const query = "SELECT id, nombre, username, foto_perfil FROM Usuarios WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return res.status(500).json({ error: "Error al buscar el usuario" });
    }

    if (results.length > 0) {
      res.status(200).json({ exists: true, user: results[0] });
    } else {
      res.status(200).json({ exists: false });
    }
  });
}

exports.emailExiste = (req, res) => {
  const { email } = req.params;

  const query = "SELECT id, nombre, username, foto_perfil FROM Usuarios WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return res.status(500).json({ error: "Error al buscar el usuario" });
    }

    if (results.length > 0) {
      res.status(200).json({ exists: true, user: results[0] });
    } else {
      res.status(200).json({ exists: false });
    }
  });
}

exports.telefonoExiste = (req, res) => {
  const { telefono } = req.params;

  const query = "SELECT id, nombre, username, foto_perfil FROM Usuarios WHERE telefono = ?";
  db.query(query, [telefono], (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return res.status(500).json({ error: "Error al buscar el usuario" });
    }

    if (results.length > 0) {
      res.status(200).json({ exists: true, user: results[0] });
    } else {
      res.status(200).json({ exists: false });
    }
  });
}