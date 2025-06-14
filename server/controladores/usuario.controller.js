const { db } = require("../db/db.config");
const { validarUsername, existeUsername } = require('../funciones/validaciones');
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
      return res.status(500).json({ mensaje: "Error al obtener el usuario" });
    }
    if (results.length > 0) {
      res.status(200).json({
        id: results[0].id,
        nombre: results[0].nombre,
        username: results[0].username,
        rol: results[0].barbero ? "barbero" : "cliente",
        foto_perfil: results[0].foto_perfil || null,
        bio: results[0].bio || null,
        email: results[0].email,
        email_verificado: results[0].email_verificado || false,
        enviar_emails: results[0].enviar_emails || false,
      });
    } else {
      res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
  });
};

exports.usuarioExiste = async (req, res) => {
  let { username } = req.params;

  const query =
    "SELECT id, nombre, username, foto_perfil, bio FROM Usuarios WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error al buscar el usuario" });
    }

    if (results.length > 0) {
      res.status(200).json({ exists: true, user: results[0] });
    } else {
      res.status(200).json({ exists: false });
    }
  });
};

exports.validarUsername = async (req, res) => {
  const { username } = req.params;
  const noValido = await validarUsername(username);
  const existe = await existeUsername(username);
  if (noValido || existe) {
    return res.status(400).json(noValido || existe);
  }
  res.status(200).json({ valido: true });
}

exports.emailExiste = (req, res) => {
  const { email } = req.params;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ mensaje: "Email inválido" });
  }

  const query = "SELECT 1 FROM Usuarios WHERE email = ? LIMIT 1";
  db.query(query, [email], (err, results) => {
    if (err) {
      // Error al buscar email
      return res.status(500).json({ mensaje: "Error al buscar el usuario" });
    }

    res.status(200).json({ exists: results.length > 0 });
  });
};

exports.putImagenPerfil = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: "No se subió ninguna imagen" });
  }

  const userId = req.user.id;
  const fotoPerfil = req.file.filename;
  const fs = require("fs");

  const getPhotoQuery = "SELECT foto_perfil FROM Usuarios WHERE id = ?";
  db.query(getPhotoQuery, [userId], (err, results) => {
    if (err) {
      // Error al obtener foto de perfil
      return res.status(500).json({ mensaje: "Error al obtener la foto actual" });
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
        return res.status(500).json({ mensaje: "Error al guardar la imagen" });
      }
      res
        .status(200)
        .json({ mensaje: "Imagen subida correctamente", fotoPerfil });
    });
  });
};

exports.editarCampo = (req, res) => {
  const userId = req.user.id;
  const { campo, valor } = req.body;
  const camposValidos = [
    "nombre",
    "username",
    "email",
    "bio",
    "enviar_emails",
    "barbero"
  ];

  if (!campo || valor === undefined) {
    return res.status(400).json({ mensaje: "Campo y valor son requeridos" });
  }

  if (!camposValidos.includes(campo)) {
    return res.status(400).json({ mensaje: `Campo inválido.` });
  }

  if (campo === 'enviar_emails') {
    db.query('SELECT email_verificado FROM Usuarios WHERE id = ?', [userId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ mensaje: 'Error validando usuario.' });
      }
      if (!results[0].email_verificado) {
        return res.status(403).json({ mensaje: 'Debes verificar tu email para modificar esta opción.' });
      }
      const query = `UPDATE Usuarios SET ${campo} = ? WHERE id = ?`;
      db.query(query, [valor, userId], (err, results) => {
        if (err) {
          // Error al actualizar campo
          return res.status(500).json({ mensaje: `Error al actualizar ${campo}` });
        }
        if (results.affectedRows > 0) {
          res.status(200).json({ mensaje: `${campo.charAt(0).toUpperCase() + campo.slice(1)} actualizado correctamente` });
        } else {
          res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
      });
    });
    return;
  }

  if (campo === 'barbero' && typeof valor !== 'boolean') {
    return res.status(400).json({ mensaje: "El valor de 'barbero' debe ser booleano (true o false)." });
  }

  const query = `UPDATE Usuarios SET ${campo} = ? WHERE id = ?`;
  db.query(query, [valor, userId], (err, results) => {
    if (err) {
      // Error al actualizar campo
      return res.status(500).json({ mensaje: `Error al actualizar ${campo}` });
    }

    if (results.affectedRows > 0) {
      res
        .status(200)
        .json({
          mensaje: `${
            campo.charAt(0).toUpperCase() + campo.slice(1)
          } actualizado correctamente`,
        });
    } else {
      res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
  });
};

exports.usuarioExisteById = (id, callback) => {
  const query =
    "SELECT id, nombre, username, foto_perfil FROM Usuarios WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      // Error al buscar usuario por id
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
      return res.status(500).json({ mensaje: 'Error al obtener el usuario' });
    }
    const { email, email_verificado, username } = results[0];
    if (email_verificado) {
      return res.status(400).json({ mensaje: 'El email ya está verificado' });
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
      .then(() => res.status(200).json({ mensaje: 'Email de verificación enviado' }))
      .catch((e) => {
        // Error al enviar email de verificación
        res.status(500).json({ mensaje: 'Error enviando email' });
      });
  });
};

// Verificar email con JWT
exports.verificarEmail = (req, res) => {
  const { token } = req.params;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Error al verificar email
      return res.status(400).json({ mensaje: 'Token inválido o expirado' });
    }
    const { id, email } = decoded;
    const query = 'UPDATE Usuarios SET email_verificado = 1 WHERE id = ? AND email = ?';
    db.query(query, [id, email], (err, result) => {
      if (err) {
        return res.status(500).json({ mensaje: 'Error actualizando verificación' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado o email no coincide' });
      }
      res.status(200).json({ mensaje: 'Email verificado correctamente' });
    });
  });
};

// Cambiar contraseña del usuario autenticado
exports.cambiarPassword = (req, res) => {
  const userId = req.user.id;
  const { actual, nueva } = req.body;
  if (!actual || !nueva) {
    return res.status(400).json({ mensaje: 'Faltan datos.' });
  }
  if (nueva.length < 6) {
    return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }
  db.query('SELECT password FROM Usuarios WHERE id = ?', [userId], async (err, results) => {
    if (err || results.length === 0) {
      // Error al obtener contraseña
      return res.status(500).json({ mensaje: 'Error validando usuario.' });
    }
    const bcrypt = require('bcrypt');
    const hash = results[0].password;
    const match = await bcrypt.compare(actual, hash);
    if (!match) {
      return res.status(400).json({ mensaje: 'La contraseña actual no es correcta.' });
    }
    const nuevaHash = await bcrypt.hash(nueva, 10);
    db.query('UPDATE Usuarios SET password = ? WHERE id = ?', [nuevaHash, userId], (err) => {
      if (err) {
        return res.status(500).json({ mensaje: 'Error actualizando la contraseña.' });
      }
      res.status(200).json({ mensaje: 'Contraseña cambiada correctamente.' });
    });
  });
};

// Recuperar contraseña: enviar email con token
exports.recuperarPassword = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ mensaje: 'El email es requerido.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ mensaje: 'Email inválido.' });
  }
  db.query('SELECT id, username FROM Usuarios WHERE email = ?', [email], (err, results) => {
    if (err) {
      // Error al buscar usuario por email
      return res.status(500).json({ mensaje: 'Error buscando usuario.' });
    }
    if (results.length === 0) {
      // No revelamos si existe o no
      return res.status(200).json({ mensaje: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.' });
    }
    const { id, username } = results[0];
    const token = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const url = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/restablecer-password/${token}`;
    const htmlTemplate = renderEmailTemplate(
      path.join(__dirname, '../emails/recuperar-password.html'),
      { username, url }
    );
    enviarEmail({
      to: email,
      subject: 'Recupera tu contraseña en Fadey',
      text: `Hola ${username},\n\nPara restablecer tu contraseña, haz clic en el siguiente enlace:\n${url}\n\nSi no has solicitado este cambio, ignora este mensaje.`,
      html: htmlTemplate
    })
      .then(() => res.status(200).json({ mensaje: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.' }))
      .catch((e) => {
        // Error al enviar email de recuperación
        res.status(500).json({ mensaje: 'Error enviando email' });
      });
  });
};

// Restablecer contraseña usando token
exports.restablecerPassword = (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(400).json({ mensaje: 'Token inválido o expirado.' });
    }
    const { id, email } = decoded;
    const bcrypt = require('bcrypt');
    const nuevaHash = await bcrypt.hash(password, 10);
    db.query('UPDATE Usuarios SET password = ? WHERE id = ? AND email = ?', [nuevaHash, id, email], (err, result) => {
      if (err) {
        // Error al restablecer contraseña
        return res.status(500).json({ mensaje: 'Error actualizando la contraseña.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
      }
      res.status(200).json({ mensaje: 'Contraseña restablecida correctamente.' });
    });
  });
};

// Enviar confirmación de eliminación de cuenta
exports.enviarConfirmacionEliminacion = (req, res) => {
  const userId = req.user.id;
  db.query('SELECT email, email_verificado, username FROM Usuarios WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ mensaje: 'Error al obtener el usuario' });
    }
    const { email, email_verificado, username } = results[0];
    if (!email_verificado) {
      return res.status(400).json({ mensaje: 'El email no está verificado.' });
    }
    // Generar token de confirmación
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const url = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/confirmar-eliminacion?token=${token}`;
    const year = new Date().getFullYear();
    const htmlTemplate = renderEmailTemplate(
      path.join(__dirname, '../emails/confirmar-eliminacion.html'),
      { username, url, year }
    );
    enviarEmail({
      to: email,
      subject: 'Confirma la eliminación de tu cuenta',
      html: htmlTemplate
    })
      .then(() => res.status(200).json({ mensaje: 'Correo de confirmación enviado' }))
      .catch(() => {
        // Error al enviar confirmación de eliminación
        res.status(500).json({ mensaje: 'No se pudo enviar el correo de confirmación.' });
      });
  });
};

exports.confirmarEliminacion = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ mensaje: 'Token requerido.' });
  }
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Error al confirmar eliminación
      return res.status(400).json({ mensaje: 'Token inválido o expirado.' });
    }
    const { id, email } = decoded;
    db.query('DELETE FROM Usuarios WHERE id = ? AND email = ?', [id, email], (err, result) => {
      if (err) {
        return res.status(500).json({ mensaje: 'Error eliminando la cuenta.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
      }
      res.status(200).json({ mensaje: 'Cuenta eliminada correctamente.' });
    });
  });
};
