const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const http = require('http');
const socketHandler = require('./socket');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



const autenticarToken = require('./autenticarToken');
const {actualizarEstadoSolicitud, eliminarRelacion} = require('./funciones/relaciones');

const app = express();
const server = http.createServer(app);
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Aceptar el archivo
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)')); // Rechazar el archivo
  }
};
const upload = multer({ storage, fileFilter, limits: {fileSize: 5 * 1024 * 1024} });


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "2004paco",
  database: "Fadey",
  // timezone: 'Europe/Madrid',
});
db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    return;
  }
  console.log("Conexión exitosa a la base de datos MySQL");
});

socketHandler(server, db);

app.post('/subir-imagen', autenticarToken, upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  const userId = req.user.id;

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
      const currentPhotoPath = `uploads/${currentPhotoUrl.split('/uploads/')[1]}`;
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
    db.query(updatePhotoQuery, [imageUrl, userId], (err) => {
      if (err) {
        console.error('Error al guardar la URL de la imagen en la base de datos:', err);
        return res.status(500).json({ error: 'Error al guardar la imagen' });
      }

      res.status(200).json({ message: 'Imagen subida correctamente', imageUrl });
    });
  });
});

app.get("/comprobar-relacion", autenticarToken, (req, res) => {
  const idBarbero = req.query.idBarbero;
  const idCliente = req.user.id;

  if (!idBarbero) {
    return res.status(400).json({ error: "ID de Barbero no proporcionado" });
  }

  const query = `
    SELECT * FROM Relaciones 
    WHERE cliente_id = ? AND barbero_id = ?
    OR barbero_id = ? AND cliente_id  = ?;
  `;
  db.query(query, [idCliente, idBarbero, idCliente, idBarbero], (err, results) => {
    if (err) {
      console.error("Error al comprobar la relación:", err);
      return res.status(500).json({ error: "Error al comprobar la relación" });
    }

    if (results.length > 0) {
      res.status(200).json({ relacion: results[0].estado });
    } else {
      res.status(200).json({ relacion: 'ninguna' });
    }
  });
})


app.get("/relaciones",autenticarToken,(req, res) => {
  const idUsuario = req.user.id;
  const query = `
    SELECT 
      Relaciones.id,
      Usuarios.username AS username,
      Usuarios.nombre AS nombre,
      Relaciones.estado,
      Relaciones.fecha_creacion
    FROM 
      Relaciones
    JOIN 
      Usuarios 
    ON 
      Relaciones.cliente_id = Usuarios.id
    WHERE 
      Relaciones.barbero_id = ? OR
      Relaciones.cliente_id = ?;  
  `;
  db.query(query, [idUsuario, idUsuario], (err, results) => {
    if (err) {
      console.error("Error al obtener solicitudes:", err);
      return res.status(500).json({ error: "Error al obtener solicitudes" });
    }

    return res.status(200).json(results);
  });
})

app.post("/aceptar-solicitud", autenticarToken, (req, res) => {
  actualizarEstadoSolicitud(req, 'aceptado', res, db);
});

app.post("/rechazar-solicitud", autenticarToken, (req, res) => {
  actualizarEstadoSolicitud(req, 'rechazado', res, db);
});

app.post("/eliminar-relacion", autenticarToken, (req, res) => {
  eliminarRelacion(req, res, db);
})

app.post("/solicitar", autenticarToken, (req, res) => {
  const { userBarbero } = req.body;
  const idCliente = req.user.id;

  if (!userBarbero) {
    return res.status(400).json({ error: "Información insuficiente" });
  }

  const idQuery = "SELECT id FROM Usuarios WHERE username = ?";
  const checkQuery = "SELECT * FROM Relaciones WHERE cliente_id = ? AND barbero_id = ?";
  const insertQuery = "INSERT INTO Relaciones (cliente_id, barbero_id, estado) VALUES (?, ?, 'pendiente')";
  
  db.query(idQuery, [userBarbero], (err, results) => {
    if (err) {
      console.error("Error al buscar el barbero:", err);
      return res.status(500).json({ error: "Error al buscar el barbero" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Barbero no encontrado" });
    }

    const idBarbero = results[0].id;

    db.query(checkQuery, [idCliente, idBarbero], (err, results) => {
      if (err) {
        console.error("Error al comprobar la relación:", err);
        return res.status(500).json({ error: "Error al comprobar la relación" });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "Ya has solicitado esta relación" });
      }

      db.query(insertQuery, [idCliente, idBarbero], (err, result) => {
        if (err) {
          console.error("Error al solicitar relación:", err);
          return res.status(500).json({ error: "Error al solicitar relación" });
        }

        res.status(200).json({ message: "Solicitud enviada" });
      });
    });
  });
})

app.post("/confirmar-reserva", autenticarToken, (req, res) => {
  const { dia, idBarbero } = req.body;
  const idCliente = req.user.id;

  if (!dia || !idBarbero) {
    return res.status(400).json({ error: "Información insuficiente" });
  }

  if (idCliente === idBarbero) {
    return res.status(400).json({ error: "No puedes reservar una cita para ti mismo" });
  }

  const fechaHora = new Date(dia)
  console.log(fechaHora)
  if (new Date(dia) < new Date()) {
    return res.status(400).json({ error: "No se puede reservar una fecha en el pasado" });
  }

  const checkQuery = 'SELECT * FROM Citas WHERE barbero_id = ? AND fecha_hora = ? AND cliente_id IS NULL';
  const updateQuery = 'UPDATE Citas SET cliente_id = ?, fecha_reservada = ? WHERE barbero_id = ? AND fecha_hora = ? AND cliente_id IS NULL';

  db.query(checkQuery, [idBarbero, fechaHora], (err, results) => {
    if (err) {
      console.error('Error al comprobar la cita:', err);
      return res.status(500).json({ error: 'Error al comprobar la cita' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'La cita no está disponible' });
    }

    db.query(updateQuery, [idCliente, new Date(), idBarbero, fechaHora], (err, result) => {
      if (err) {
        console.error('Error al confirmar reserva:', err);
        return res.status(500).json({ error: 'Error al confirmar reserva' });
      }

      res.status(200).json({ message: 'Reserva confirmada', dia });
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
        rol: usuario.barbero ? 'barbero' : 'cliente',
        pic: usuario.foto_perfil
      }
    });
  });
});

app.post("/crear-citas", autenticarToken, async (req, res) => {
  const { fechas, idBarbero } = req.body;

  if (req.user.id !== idBarbero) {
    return res.status(403).json({ error: "No tienes permiso para crear citas para este barbero" });
  }

  if (!fechas || !idBarbero) {
    return res.status(400).json({ error: "Información insuficiente" });
  }

  const checkQuery = 'SELECT * FROM Citas WHERE barbero_id = ? AND fecha_hora = ?';
  const insertQuery = 'INSERT INTO Citas (barbero_id, fecha_hora) VALUES (?, ?)';
  const deleteQuery = 'DELETE FROM Citas WHERE barbero_id = ? AND fecha_hora = ?';
  try {
    for (const fecha of fechas) {
      const fechaHora = new Date(fecha);
      if(fechaHora.getFullYear() < 2024){
        continue;
      }
      const [results] = await db.promise().query(checkQuery, [idBarbero, fechaHora]);
      if (results.length > 0) {
        await db.promise().query(deleteQuery, [idBarbero, fechaHora]);
      }
      else{
        await db.promise().query(insertQuery, [idBarbero, fechaHora]);
      }
    }

    res.status(200).json({ message: "Citas creadas exitosamente" });
  } catch (err) {
    console.error("Error al procesar las citas:", err);
    res.status(500).json({ error: "Error al procesar las citas" });
  }
});

app.post("/citas", autenticarToken, async(req, res) => {
  const idUsuario = req.user.id;
  const {inicio, fin, idBarbero} = req.body;

  if(idUsuario != idBarbero){
    const queryRelacion = "SELECT count(*) AS existe FROM Relaciones WHERE (cliente_id = ? AND barbero_id = ? OR barbero_id = ? AND cliente_id = ?) AND estado = 'aceptado';";
    const [relacion] = await db.promise().query(queryRelacion, [idUsuario, idBarbero, idUsuario, idBarbero]);
    if (!relacion[0].existe) {
      return res.status(403).json({ error: "No tienes permisos para ver las citas de este barbero" });
    }
  }

  const queryEsBarbero = "SELECT barbero FROM usuarios WHERE id = ?;"
  const esBarbero = await db.promise().query(queryEsBarbero, [idBarbero]);
  if(!esBarbero[0][0].barbero) return res.status(400).json({error: "No es barbero"});

  try{
    const queryTotales = "SELECT fecha_hora FROM citas WHERE barbero_id like ? and fecha_hora BETWEEN ? AND ?;"
    const queryReservadas = "SELECT fecha_hora FROM citas WHERE barbero_id like ? and cliente_id is not NULL and fecha_hora BETWEEN ? AND ?;"
    const queryReservadasUsuario = "SELECT fecha_hora FROM citas WHERE barbero_id like ? and cliente_id = ? and fecha_hora BETWEEN ? AND ?;";
    let totales = await db.promise().query(queryTotales, [idBarbero, inicio, fin])
    totales = totales[0].map((cita) => {
      return cita.fecha_hora;
    });
    let reservadas = await db.promise().query(queryReservadas, [idBarbero, inicio, fin]);
    reservadas = reservadas[0].map((cita) => {
      return cita.fecha_hora;
    });
    let reservadasUsuario = await db.promise().query(queryReservadasUsuario, [idBarbero, idUsuario, inicio, fin]);
    reservadasUsuario = reservadasUsuario[0].map((cita) => {
      return cita.fecha_hora;
    });
    console.log(inicio,fin,totales)
    res.status(200).json({totales, reservadas, reservadasUsuario});
  }
  catch(err){
    console.error("Error al procesar las citas:", err);
    res.status(500).json({ error: "Error al procesar las citas" });
  }

})

// app.get("/usuario/:id", (req, res) => {
//   const { id } = req.params;

//   const query = "SELECT nombre, username FROM Usuarios WHERE id = ?";
//   db.query(query, [id], (err, results) => {
//     if (err) {
//       console.error("Error al obtener usuario:", err);
//       return res.status(500).json({ error: "Error al obtener usuario" });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ error: "Usuario no encontrado" });
//     }

//     res.status(200).json(results[0]);
//   });
// });

app.get("/usuario/:username", async (req, res) => {
  const { username } = req.params;

  const query = "SELECT * FROM Usuarios WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return res.status(500).json({ error: "Error al buscar el usuario" });
    }

    if (results.length > 0) {
      res.status(200).json({ exists: true, idBarbero: results[0].id });
    } else {
      res.status(200).json({ exists: false });
    }
  });
});

app.get("/usuarios/email/:email", (req, res) => {
  const { email } = req.params;

  const query = "SELECT * FROM Usuarios WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error al buscar el email:", err);
      return res.status(500).json({ error: "Error al buscar el email" });
    }

    if (results.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  });
});

app.get("/usuarios/telefono/:telefono", (req, res) => {
  const { telefono } = req.params;

  const query = "SELECT * FROM Usuarios WHERE telefono = ?";
  db.query(query, [telefono], (err, results) => {
    if (err) {
      console.error("Error al buscar el teléfono:", err);
      return res.status(500).json({ error: "Error al buscar el teléfono" });
    }

    if (results.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  });
});

app.get("/citas-usuario", autenticarToken, (req, res) => {
  const { id } = req.user;

  const query = `
    SELECT Citas.id, Citas.fecha_hora, Usuarios.nombre AS barbero_nombre, Usuarios.username AS barbero_username 
    FROM Citas 
    JOIN Usuarios ON Citas.barbero_id = Usuarios.id 
    WHERE Citas.cliente_id = ?
    ORDER BY Citas.fecha_hora ASC
    `;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener citas del usuario:", err);
      return res.status(500).json({ error: "Error al obtener citas del usuario" });
    }

    res.status(200).json(results);
  });
});

app.get('/mensajes', autenticarToken, (req, res) => {
  const { emisor_id, receptor_id } = req.query;

  const query = `
    SELECT * FROM Mensajes
    WHERE (emisor_id = ? AND receptor_id = ?)
       OR (emisor_id = ? AND receptor_id = ?)
    ORDER BY fecha_envio ASC
  `;
  db.query(query, [emisor_id, receptor_id, receptor_id, emisor_id], (err, results) => {
    if (err) {
      console.error('Error al obtener mensajes:', err);
      return res.status(500).json({ error: 'Error al obtener mensajes' });
    }
    res.status(200).json(results);
  });
});

app.get('/chats', autenticarToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      CASE 
        WHEN emisor_id = ? THEN receptor_id
        ELSE emisor_id
      END AS usuario_id,
      MAX(fecha_envio) AS ultima_fecha,
      MIN(mensaje) AS ultimo_mensaje
    FROM Mensajes
    WHERE emisor_id = ? OR receptor_id = ?
    GROUP BY usuario_id
    ORDER BY ultima_fecha DESC;
  `;

  db.query(query, [userId, userId, userId], (err, results) => {
    if (err) {
      console.error('Error al obtener los chats:', err);
      return res.status(500).json({ error: 'Error al obtener los chats' });
    }
    const userIds = results.map(chat => chat.usuario_id);
    if (userIds.length > 0) {
      const userQuery = `SELECT id, username FROM Usuarios WHERE id IN (?)`;
      db.query(userQuery, [userIds], (err, userResults) => {
        if (err) {
          console.error('Error al obtener usernames:', err);
          return res.status(500).json({ error: 'Error al obtener usernames' });
        }
        const usernamesMap = userResults.reduce((map, user) => {
          map[user.id] = user.username;
          return map;
        }, {});
        results.forEach(chat => {
          chat.username = usernamesMap[chat.usuario_id] || null;
        });
        res.status(200).json(results);
      });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get("/es-barbero/:id", (req, res) => {
  const { id } = req.params;

  const query = "SELECT barbero FROM Usuarios WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return res.status(500).json({ error: "Error al buscar el usuario" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(results[0]);
  });
});

// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});