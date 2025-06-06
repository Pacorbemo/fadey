const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db/db.config');
const { validarUsername, validarEmail } = require('../funciones/validaciones');

const JWT_SECRET = process.env.JWT_SECRET;

exports.registro = async (req, res) => {
  let { nombre, username, telefono, barbero, email, password } = req.body;
  if (!nombre || !username || !telefono || !email || !password) {
    return res.status(400).json({ error: "Información insuficiente" });
  }

  if(nombre.length > 50) {
    return res.status(400).json({ error: "El nombre no puede tener más de 50 caracteres" });
  }
  
  if (!/^\d{7,15}$/.test(telefono)) {
    return res.status(400).json({ error: "El teléfono no es válido" });
  }
  
  if (typeof barbero != 'boolean') {
    return res.status(400).json({ error: "El campo 'barbero' debe ser un booleano" });
  }
  
  if(password.length < 6 || password.length > 32) {
    return res.status(400).json({ error: "La contraseña debe tener entre 6 y 32 caracteres" });
  }
  
  if (usernameError = validarUsername(username)) {
    return res.status(400).json({ error: usernameError });
  }

  if (emailError = validarEmail(email)) {
    return res.status(400).json({ error: emailError });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO Usuarios (nombre, username, telefono, barbero, email, password) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [nombre, username, telefono, barbero, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error al registrar usuario:", err);
        return res.status(500).json({ error: "Error al registrar usuario" });
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
    console.error("Error al hashear la contraseña:", error);
    res.status(500).json({ error: "Error al procesar la contraseña" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Información insuficiente" });
  }

  const query = "SELECT * FROM Usuarios WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Error al buscar usuario:", err);
      return res.status(500).json({ error: "Error al buscar usuario" });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const usuario = results[0];
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
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
        localizacion: usuario.localizacion || '',
        telefono: usuario.telefono || '',
        enviar_emails: usuario.enviar_emails || false,
        email_verificado: usuario.email_verificado || false
      }
    });
  });
};