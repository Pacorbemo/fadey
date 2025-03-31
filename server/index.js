const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const autenticarToken = require('./autenticarToken');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "2004paco",
  database: "Fadey",
});
db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    return;
  }
  console.log("Conexión exitosa a la base de datos MySQL");
});

app.post("/confirmar-reserva", autenticarToken, (req, res) => {
  const { dia, idBarbero } = req.body;
  if (!dia || !idBarbero) {
    return res.status(400).json({ error: "Información insuficiente" });
  }

  console.log(dia); 
  const fechaHora = new Date(dia).toISOString().slice(0, 19).replace('T', ' ');
  const idCliente = req.user.id; 

  const query = 'INSERT INTO Citas (barbero_id, cliente_id, fecha_hora) VALUES (?, ?, ?)';
  db.query(query, [idBarbero, idCliente, fechaHora], (err, result) => {
    if (err) {
      console.error('Error al confirmar reserva:', err);
      return res.status(500).json({ error: 'Error al confirmar reserva' });
    }

    res.status(200).json({ message: 'Reserva confirmada', dia
     });
  });
});

app.post("/registro", async (req, res) => {
  const { nombre, username, telefono, barbero, email, password } = req.body;

  if (!nombre || !username || !telefono || !email || !password) {
    return res.status(400).json({ error: "Información insuficiente" });
  }

  const checkQuery = "SELECT * FROM Usuarios WHERE username = ? OR email = ?";
  db.query(checkQuery, [username, email], async (err, results) => {
    if (err) {
      console.error("Error al comprobar usuario o email:", err);
      return res
        .status(500)
        .json({ error: "Error al comprobar usuario o email" });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ error: "El username o email ya está en uso" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10); // Hashear la contraseña
      const query =
        "INSERT INTO Usuarios (nombre, username, telefono, barbero, email, password) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        query,
        [nombre, username, telefono, barbero, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("Error al registrar usuario:", err);
            return res.status(500).json({ error: "Error al registrar usuario" });
          }

          const userId = result.insertId; 
          const token = jwt.sign(
            { id: userId, username, rol: barbero ? "barbero" : "cliente" },
            "jtnhu37569",
            { expiresIn: "1h" }
          );

          res.status(200).json({
            token,
            user: {
              id: userId,
              username,
              nombre,
              rol: barbero ? "barbero" : "cliente",
            },
          });
          
        }
      );
    } catch (error) {
      console.error("Error al hashear la contraseña:", error);
      res.status(500).json({ error: "Error al procesar la contraseña" });
    }
  });
});

app.post("/login", async (req, res) => {
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
      'jtnhu37569', 
      // { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.barbero ? 'barbero' : 'cliente'
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
