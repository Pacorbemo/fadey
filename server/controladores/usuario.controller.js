const { db } = require("../db/db.config");
const { validarUsername } = require('../funciones/validaciones');
const enviarEmail = require('../funciones/email');
const jwt = require('jsonwebtoken');
const path = require('path');
const renderEmailTemplate = require('../funciones/renderEmailTemplate');

exports.getUsuario = (req, res) => {
  const userId = req.user.id;
  const query =
    "SELECT * FROM Usuarios WHERE id = ?";
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
        foto_perfil: results[0].foto_perfil || null,
        localizacion: results[0].localizacion || null,
        bio: results[0].bio || null,
        email: results[0].email,
        email_verificado: results[0].email_verificado || false,
        enviar_emails: results[0].enviar_emails || false,
        telefono: results[0].telefono || null,
      });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  });
};

exports.usuarioExiste = (req, res) => {
  let { username } = req.params;

  const usernameError = validarUsername(username);
  if (usernameError) {
    return res.status(400).json({ error: usernameError });
  }

  const query =
    "SELECT id, nombre, username, foto_perfil, bio, localizacion FROM Usuarios WHERE username = ?";
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
};

exports.emailExiste = (req, res) => {
  const { email } = req.params;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }

  const query = "SELECT 1 FROM Usuarios WHERE email = ? LIMIT 1";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return res.status(500).json({ error: "Error al buscar el usuario" });
    }

    res.status(200).json({ exists: results.length > 0 });
  });
};

exports.telefonoExiste = (req, res) => {
  const { telefono } = req.params;

  if (!telefono) {
    return res.status(400).json({ error: "El teléfono es requerido" });
  }

  const query = "SELECT 1 FROM Usuarios WHERE telefono = ? LIMIT 1";
  db.query(query, [telefono], (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return res.status(500).json({ error: "Error al buscar el usuario" });
    }

    res.status(200).json({ exists: results.length > 0 });
  });
};

exports.putImagenPerfil = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }

  const userId = req.user.id;
  const fotoPerfil = req.file.filename;
  const fs = require("fs");

  const getPhotoQuery = "SELECT foto_perfil FROM Usuarios WHERE id = ?";
  db.query(getPhotoQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener la foto actual:", err);
      return res.status(500).json({ error: "Error al obtener la foto actual" });
    }

    const currentPhotoUrl = results[0]?.foto_perfil;

    if (currentPhotoUrl) {
      const currentPhotoPath = `uploads/${currentPhotoUrl}`;
      fs.unlink(currentPhotoPath, (err) => {
        if (err) {
          console.error("Error al eliminar la foto anterior:", err);
        } else {
          console.log("Foto anterior eliminada:", currentPhotoPath);
        }
      });
    }

    const updatePhotoQuery = "UPDATE Usuarios SET foto_perfil = ? WHERE id = ?";
    db.query(updatePhotoQuery, [fotoPerfil, userId], (err) => {
      if (err) {
        console.error(
          "Error al guardar la URL de la imagen en la base de datos:",
          err
        );
        return res.status(500).json({ error: "Error al guardar la imagen" });
      }

      res
        .status(200)
        .json({ message: "Imagen subida correctamente", fotoPerfil });
    });
  });
};

exports.editarCampo = (req, res) => {
  const userId = req.user.id;
  const { campo, valor } = req.body;
  const camposValidos = [
    "nombre",
    "username",
    "telefono",
    "email",
    "localizacion",
    "bio",
  ];

  if (!campo || !valor) {
    return res.status(400).json({ error: "Campo y valor son requeridos" });
  }

  if (!camposValidos.includes(campo)) {
    return res.status(400).json({ error: `Campo inválido.` });
  }

  const query = `UPDATE Usuarios SET ${campo} = ? WHERE id = ?`;
  db.query(query, [valor, userId], (err, results) => {
    if (err) {
      console.error(`Error al actualizar el campo ${campo}:`, err);
      return res.status(500).json({ error: `Error al actualizar ${campo}` });
    }

    if (results.affectedRows > 0) {
      res
        .status(200)
        .json({
          message: `${
            campo.charAt(0).toUpperCase() + campo.slice(1)
          } actualizado correctamente`,
        });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  });
};

exports.usuarioExisteById = (id, callback) => {
  const query =
    "SELECT id, nombre, username, foto_perfil FROM Usuarios WHERE id = ?";
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

// Enviar email de verificación (con JWT, sin tabla extra)
exports.enviarVerificacionEmail = (req, res) => {
  const userId = req.user.id;
  const query = 'SELECT email, email_verificado, username FROM Usuarios WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: 'Error al obtener el usuario' });
    }
    const { email, email_verificado, username } = results[0];
    if (email_verificado) {
      return res.status(400).json({ error: 'El email ya está verificado' });
    }
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const url = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/verificar-email?token=${token}`;
    const htmlTemplate = renderEmailTemplate(
      path.join(__dirname, '../emails/verificacion-email.html'),
      { username, url }
    );
    enviarEmail({
      to: email,
      subject: 'Verifica tu email en Fadey',
      text: `Hola ${username},\n\n¡Bienvenido a Fadey!\n\nPara proteger tu cuenta y acceder a todas las funciones, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente enlace:\n\n${url}\n\nEste enlace es válido por 24 horas. Si no has solicitado esta verificación, puedes ignorar este mensaje.\n\nGracias por confiar en Fadey.\n\nEl equipo de Fadey`,
      html: htmlTemplate
    })
      .then(() => res.status(200).json({ message: 'Email de verificación enviado' }))
      .catch((e) => {
        console.error('Error enviando email:', e);
        res.status(500).json({ error: 'Error enviando email' });
      });
  });
};

// Verificar email con JWT
exports.verificarEmail = (req, res) => {
  const { token } = req.params;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    const { id, email } = decoded;
    const query = 'UPDATE Usuarios SET email_verificado = 1 WHERE id = ? AND email = ?';
    db.query(query, [id, email], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error actualizando verificación' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado o email no coincide' });
      }
      res.status(200).json({ message: 'Email verificado correctamente' });
    });
  });
};

// Cambiar contraseña del usuario autenticado
exports.cambiarPassword = (req, res) => {
  const userId = req.user.id;
  const { actual, nueva } = req.body;
  if (!actual || !nueva) {
    return res.status(400).json({ error: 'Faltan datos.' });
  }
  if (nueva.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }
  db.query('SELECT password FROM Usuarios WHERE id = ?', [userId], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: 'Error validando usuario.' });
    }
    const bcrypt = require('bcrypt');
    const hash = results[0].password;
    const match = await bcrypt.compare(actual, hash);
    if (!match) {
      return res.status(400).json({ error: 'La contraseña actual no es correcta.' });
    }
    const nuevaHash = await bcrypt.hash(nueva, 10);
    db.query('UPDATE Usuarios SET password = ? WHERE id = ?', [nuevaHash, userId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error actualizando la contraseña.' });
      }
      res.status(200).json({ message: 'Contraseña cambiada correctamente.' });
    });
  });
};
