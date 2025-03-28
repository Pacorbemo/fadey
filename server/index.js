const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

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

app.post("/confirmar-reserva", (req, res) => {
  const { idBarbero, idCliente, dia, hora } = req.body;

  if (!dia || !hora || !idBarbero || !idCliente) {
    return res.status(400).json({ error: "Información insuficiente" });
  }

  console.log(
    `Reserva confirmada para el barbero ${idBarbero} por el cliente ${idCliente} el día ${dia} a las ${hora}`
  );
  res.status(200).json({ message: "Reserva confirmada", dia, hora });
});

app.post("/registro", (req, res) => {
  const { nombre, username, telefono, barbero, email, password } = req.body;

  if (!nombre || !username || !telefono || !barbero || !email || !password) {
    return res.status(400).json({ error: "Información insuficiente" });
  }

  const checkQuery = "SELECT * FROM Usuarios WHERE username = ? OR email = ?";
  db.query(checkQuery, [username, email], (err, results) => {
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

    const query =
      "INSERT INTO Usuarios (nombre, username, telefono, barbero, email, password) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      [nombre, username, telefono, barbero, email, password],
      (err, result) => {
        if (err) {
          console.error("Error al registrar usuario:", err);
          return res.status(500).json({ error: "Error al registrar usuario" });
        }

        console.log(`Usuario registrado: ${nombre} ${username}, email: ${email}`);
        res
          .status(200)
          .json({ message: "Usuario registrado", nombre, username, email });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
