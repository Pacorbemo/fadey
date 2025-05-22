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

exports.putImagenPerfil = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  const userId = req.user.id;
  const fotoPerfil = req.file.filename;
  const fs = require('fs');

  // Obtener la URL de la foto actual del usuario
  const getPhotoQuery = 'SELECT foto_perfil FROM Usuarios WHERE id = ?';
  db.query(getPhotoQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener la foto actual:', err);
      return res.status(500).json({ error: 'Error al obtener la foto actual' });
    }

    const currentPhotoUrl = results[0]?.foto_perfil;

    // Eliminar la foto anterior si existe
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

    // Guardar la nueva URL de la foto en la base de datos
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