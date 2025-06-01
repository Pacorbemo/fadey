const { db } = require("../db/db.config");

exports.getUsuario = (req, res) => {
  const userId = req.user.id;
  const query = "SELECT id, nombre, username, barbero, foto_perfil FROM Usuarios WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener el usuario:", err);
      return res.status(500).json({ error: "Error al obtener el usuario" });
    }
    if (results.length > 0) {
      res.status(200).json({
        id: results[0].id,
        nombre: results[0].nombre,
        username: results[0].username,
        rol: results[0].barbero ? "barbero" : "cliente",
        pic: results[0].foto_perfil
      });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  });
};

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

exports.putImagenPerfil = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  const userId = req.user.id;
  const fotoPerfil = req.file.filename;
  const fs = require('fs');

  const getPhotoQuery = 'SELECT foto_perfil FROM Usuarios WHERE id = ?';
  db.query(getPhotoQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener la foto actual:', err);
      return res.status(500).json({ error: 'Error al obtener la foto actual' });
    }

    const currentPhotoUrl = results[0]?.foto_perfil;

    if (currentPhotoUrl) {
      const currentPhotoPath = `uploads/${currentPhotoUrl}`;
      fs.unlink(currentPhotoPath, (err) => {
        if (err) {
          console.error('Error al eliminar la foto anterior:', err);
        } else {
          console.log('Foto anterior eliminada:', currentPhotoPath);
        }
      });
    }

    const updatePhotoQuery = 'UPDATE Usuarios SET foto_perfil = ? WHERE id = ?';
    db.query(updatePhotoQuery, [fotoPerfil, userId], (err) => {
      if (err) {
        console.error('Error al guardar la URL de la imagen en la base de datos:', err);
        return res.status(500).json({ error: 'Error al guardar la imagen' });
      }

      res.status(200).json({ message: 'Imagen subida correctamente', fotoPerfil });
    });
  });
}

exports.putNombre = (req, res) => {
  const userId = req.user.id;
  const { nombre } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre no puede estar vacío' });
  }

  const query = "UPDATE Usuarios SET nombre = ? WHERE id = ?";
  db.query(query, [nombre, userId], (err, results) => {
    if (err) {
      console.error("Error al actualizar el nombre:", err);
      return res.status(500).json({ error: "Error al actualizar el nombre" });
    }

    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Nombre actualizado correctamente" });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  });
}

exports.usuarioExisteById = (id, callback) => {
  const query = "SELECT id, nombre, username, foto_perfil FROM Usuarios WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return callback(err, null);
    }
    if (results.length > 0) {
      callback(null, results[0]);
    } else {
      callback(null, null);
    }
  });
};