const { db } = require('../db/db.config');

exports.crearCitas = async (req, res) => {
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
      if (fechaHora.getFullYear() < 2024) continue;
      
      const [results] = await db.promise().query(checkQuery, [idBarbero, fechaHora]);
      if (results.length > 0) {
        await db.promise().query(deleteQuery, [idBarbero, fechaHora]);
      } else {
        await db.promise().query(insertQuery, [idBarbero, fechaHora]);
      }
    }
    res.status(200).json({ message: "Citas creadas exitosamente" });
  } catch (err) {
    console.error("Error al crear citas:", err);
    res.status(500).json({ error: "Error al procesar las citas" });
  }
};

exports.obtenerCitas = async (req, res) => {
  const idUsuario = req.user.id;
  const { inicio, fin, idBarbero } = req.body;
  
  if (idUsuario != idBarbero) {
    const queryRelacion = "SELECT count(*) AS existe FROM Relaciones WHERE (cliente_id = ? AND barbero_id = ? OR barbero_id = ? AND cliente_id = ?) AND estado = 'aceptado';";
    const [relacion] = await db.promise().query(queryRelacion, [idUsuario, idBarbero, idUsuario, idBarbero]);
    if (!relacion[0].existe) {
      return res.status(403).json({ error: "No tienes permisos para ver las citas de este barbero" });
    }
  }
  
  const queryEsBarbero = "SELECT barbero FROM Usuarios WHERE id = ?;";
  const esBarbero = await db.promise().query(queryEsBarbero, [idBarbero]);
  if (!esBarbero[0][0].barbero) {
    return res.status(400).json({ error: "No es barbero" });
}
  
  try {
    const queryTotales = "SELECT fecha_hora FROM Citas WHERE barbero_id LIKE ? AND fecha_hora BETWEEN ? AND ?;";
    const queryReservadas = "SELECT fecha_hora FROM Citas WHERE barbero_id LIKE ? AND cliente_id IS NOT NULL AND fecha_hora BETWEEN ? AND ?;";
    const queryReservadasUsuario = "SELECT fecha_hora FROM Citas WHERE barbero_id LIKE ? AND cliente_id = ? AND fecha_hora BETWEEN ? AND ?;";
    
    let totales = await db.promise().query(queryTotales, [idBarbero, inicio, fin]);
    totales = totales[0].map(cita => cita.fecha_hora);
    
    let reservadas = await db.promise().query(queryReservadas, [idBarbero, inicio, fin]);
    reservadas = reservadas[0].map(cita => cita.fecha_hora);
    
    let reservadasUsuario = await db.promise().query(queryReservadasUsuario, [idBarbero, idUsuario, inicio, fin]);
    reservadasUsuario = reservadasUsuario[0].map(cita => cita.fecha_hora);
    
    res.status(200).json({ totales, reservadas, reservadasUsuario });
  } catch (err) {
    console.error("Error al obtener citas:", err);
    res.status(500).json({ error: "Error al obtener citas" });
  }
};

exports.obtenerCitasBarbero = async (req, res) => {
  const { id } = req.user;

  const query = `
    SELECT Citas.id, Citas.fecha_hora, Usuarios.nombre AS usuario_nombre, Usuarios.username AS usuario_username 
    FROM Citas 
    JOIN Usuarios ON Citas.cliente_id = Usuarios.id 
    WHERE Citas.barbero_id = ? AND Citas.fecha_hora > NOW()
    ORDER BY Citas.fecha_hora ASC
    `;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener citas del barbero:", err);
      return res.status(500).json({ error: "Error al obtener citas del barbero" });
    }

    res.status(200).json(results);
  });
};

exports.obtenerCitasCliente = async (req, res) => {
  const { id } = req.user;

  const query = `
    SELECT Citas.id, Citas.fecha_hora, Usuarios.nombre AS usuario_nombre, Usuarios.username AS usuario_username 
    FROM Citas 
    JOIN Usuarios ON Citas.barbero_id = Usuarios.id 
    WHERE Citas.cliente_id = ? AND Citas.fecha_hora > NOW()
    ORDER BY Citas.fecha_hora ASC
    `;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener citas del usuario:", err);
      return res.status(500).json({ error: "Error al obtener citas del usuario" });
    }

    res.status(200).json(results);
  });
}

exports.obtenerProximasCitas = async (req, res) => {
  const { id } = req.user;
  const query = `
    SELECT Citas.id, Citas.fecha_hora, Usuarios.nombre AS usuario_nombre, Usuarios.username AS usuario_username 
    FROM Citas 
    JOIN Usuarios ON Citas.cliente_id = Usuarios.id 
    WHERE Citas.barbero_id = ? AND Citas.fecha_hora > NOW()
    ORDER BY Citas.fecha_hora ASC
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener próximas citas del barbero:", err);
      return res.status(500).json({ error: "Error al obtener próximas citas del barbero" });
    }

    res.status(200).json(results);
  });
}

exports.confirmarCita = async (req, res) => {
  const { dia, idBarbero } = req.body;
  const idCliente = req.user.id;

  if (!dia || !idBarbero) {
    return res.status(400).json({ error: "Información insuficiente" });
  }

  if (idCliente === idBarbero) {
    return res.status(400).json({ error: "No puedes reservar una cita para ti mismo" });
  }

  const fechaHora = new Date(dia)
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
}