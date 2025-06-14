const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db/db.config');
const { validarUsername, validarEmail } = require('../funciones/validaciones');

const JWT_SECRET = process.env.JWT_SECRET;

exports.registro = async (req, res) => {
  let { nombre, username, barbero, email, password } = req.body;
  if (!nombre || !username || !email || !password) {
    return res.status(400).json({ mensaje: "Información insuficiente" });
  }

  if(nombre.length > 50) {
    return res.status(400).json({ mensaje: "El nombre no puede tener más de 50 caracteres" });
  }
  
  if (typeof barbero != 'boolean') {
    return res.status(400).json({ mensaje: "El campo 'barbero' debe ser un booleano" });
  }
  
  if(password.length < 6 || password.length > 32) {
    return res.status(400).json({ mensaje: "La contraseña debe tener entre 6 y 32 caracteres" });
  }
  
  const usernameError = await validarUsername(username);
  if (usernameError) {
    return res.status(400).json({ mensaje: usernameError });
  }

  const emailError = await validarEmail(email);
  if (emailError) {
    return res.status(400).json({ mensaje: emailError });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO Usuarios (nombre, username, barbero, email, password) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [nombre, username, barbero, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ mensaje: "Error al registrar usuario" });
      }

      const userId = result.insertId;
      const token = jwt.sign(
        { id: userId, username, rol: barbero ? "barbero" : "cliente" },
        JWT_SECRET
      );

      res.status(200).json({
        token,
        user: { id: userId, email, username, nombre, rol: barbero ? "barbero" : "cliente" }
      });
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al procesar la contraseña" });
  }
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      mensaje: 'Debes rellenar todos los campos.',
      sugerencia: 'Por favor, introduce tu usuario y contraseña.'
    });
  }

  const query = "SELECT * FROM Usuarios WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error al buscar usuario" });
    }
    if (results.length === 0) {
      return res.status(400).json({ mensaje: "El usuario no existe" });
    }

    const usuario = results[0];
    const coincidePassword = await bcrypt.compare(password, usuario.password);
    if (!coincidePassword) {
      return res.status(401).json({
        mensaje: 'Usuario o contraseña incorrectos',
        sugerencia: '¿Olvidaste tu contraseña? Usa el enlace para recuperarla.'
      });
    }

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username, rol: usuario.barbero ? 'barbero' : 'cliente' },
      JWT_SECRET
    );

    res.status(200).json({
      token,
      user: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.barbero ? 'barbero' : 'cliente',
        foto_perfil: usuario.foto_perfil,
        email: usuario.email,
        bio: usuario.bio || '',
        enviar_emails: usuario.enviar_emails || false,
        email_verificado: usuario.email_verificado || false
      }
    });
  });
};