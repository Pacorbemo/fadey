const { db } = require('../db/db.config');
const crearNotificacion = require('../funciones/notificaciones.functions');

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
    res.status(200).json({ mensaje: "Citas creadas exitosamente" });
  } catch (err) {
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
    // Error al obtener citas
    res.status(500).json({ error: "Error al obtener citas" });
  }
};

exports.obtenerCitasBarbero = async (req, res) => {
  const { id } = req.user;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const query = `
    SELECT Citas.id, Citas.fecha_hora, Usuarios.nombre AS usuario_nombre, Usuarios.username AS usuario_username 
    FROM Citas 
    JOIN Usuarios ON Citas.cliente_id = Usuarios.id 
    WHERE Citas.barbero_id = ? AND Citas.fecha_hora > NOW()
    ORDER BY Citas.fecha_hora ASC
    LIMIT ? OFFSET ?
    `;
  db.query(query, [id, limit, offset], (err, results) => {
    if (err) {
      // Error al obtener citas del barbero
      return res.status(500).json({ error: "Error al obtener citas del barbero" });
    }
    res.status(200).json(results);
  });
};

exports.obtenerCitasCliente = async (req, res) => {
  const { id } = req.user;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const query = `
    SELECT Citas.id, Citas.fecha_hora, Usuarios.nombre AS usuario_nombre, Usuarios.username AS usuario_username 
    FROM Citas 
    JOIN Usuarios ON Citas.barbero_id = Usuarios.id 
    WHERE Citas.cliente_id = ? AND Citas.fecha_hora > NOW()
    ORDER BY Citas.fecha_hora ASC
    LIMIT ? OFFSET ?
    `;
  db.query(query, [id, limit, offset], (err, results) => {
    if (err) {
      // Error al obtener citas del usuario
      return res.status(500).json({ error: "Error al obtener citas del usuario" });
    }
    res.status(200).json(results);
  });
};

exports.obtenerProximasCitas = async (req, res) => {
  const { id } = req.user;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const query = `
    SELECT Citas.id, Citas.fecha_hora, Usuarios.nombre AS usuario_nombre, Usuarios.username AS usuario_username 
    FROM Citas 
    JOIN Usuarios ON Citas.cliente_id = Usuarios.id 
    WHERE Citas.barbero_id = ? AND Citas.fecha_hora > NOW()
    ORDER BY Citas.fecha_hora ASC
    LIMIT ? OFFSET ?
  `;
  db.query(query, [id, limit, offset], (err, results) => {
    if (err) {
      // Error al obtener próximas citas del barbero
      return res.status(500).json({ error: "Error al obtener próximas citas del barbero" });
    }
    res.status(200).json(results);
  });
};

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
      // Error al comprobar la cita
      return res.status(500).json({ error: 'Error al comprobar la cita' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'La cita no está disponible' });
    }

    db.query(updateQuery, [idCliente, new Date(), idBarbero, fechaHora], (err, result) => {
      if (err) {
        // Error al confirmar reserva
        return res.status(500).json({ error: 'Error al confirmar reserva' });
      }

      crearNotificacion({
        usuario_id: idBarbero,
        emisor_id: idCliente,
        tipo: 'cita',
        mensaje: fechaHora,
      });

      res.status(200).json({ mensaje: 'Reserva confirmada', dia });
    });
  });
}

exports.generarCitasSemana = async (req, res) => {
  const idBarbero = req.user.id;
  const { inicio, fin } = req.body;
  if (!inicio || !fin) {
    return res.status(400).json({ error: "Faltan fechas de inicio o fin" });
  }
  try {
    const [usuarios] = await db.promise().query(
      "SELECT horario FROM Usuarios WHERE id = ? AND barbero = 1",
      [idBarbero]
    );
    if (!usuarios.length || !usuarios[0].horario) {
      return res.status(400).json({ error: "No hay patrón de horario guardado" });
    }
    let horario;
    try {
      if (typeof usuarios[0].horario === 'string') {
        horario = JSON.parse(usuarios[0].horario);
      } else if (Array.isArray(usuarios[0].horario)) {
        horario = usuarios[0].horario;
      } else {
        horario = JSON.parse(JSON.stringify(usuarios[0].horario));
      }
    } catch (e) {
      return res.status(400).json({ error: "Formato de horario inválido" });
    }
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    const franjas = [];
    for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
      const diaSemana = d.getDay() === 0 ? 6 : d.getDay() - 1; // Lunes=0 Domingo=6
      const dia = horario[diaSemana];
      if (dia && dia.abierto) {
        let [hIni, mIni] = dia.inicio.split(":").map(Number);
        let [hFin, mFin] = dia.fin.split(":").map(Number);
        let actual = new Date(d);
        actual.setHours(hIni, mIni, 0, 0);
        const finDia = new Date(d);
        finDia.setHours(hFin, mFin, 0, 0);
        while (actual < finDia) {
          franjas.push(new Date(actual));
          actual = new Date(actual.getTime() + 30 * 60000);
        }
      }
    }
    console.log(fechaInicio, fechaFin)
    const deleteLibresQuery = `DELETE FROM Citas WHERE barbero_id = ? AND fecha_hora >= ? AND fecha_hora <= ? AND cliente_id IS NULL`;
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(23, 59, 59, 999);
    await db.promise().query(deleteLibresQuery, [idBarbero, fechaInicio, fechaFin]);
    const checkQuery = 'SELECT COUNT(*) as existe FROM Citas WHERE barbero_id = ? AND fecha_hora = ?';
    const insertQuery = 'INSERT INTO Citas (barbero_id, fecha_hora) VALUES (?, ?)';
    let creadas = 0;
    for (const franja of franjas) {
      const [existe] = await db.promise().query(checkQuery, [idBarbero, franja]);
      if (existe[0].existe === 0) {
        await db.promise().query(insertQuery, [idBarbero, franja]);
        creadas++;
      }
    }
    res.status(200).json({ ok: true, creadas });
  } catch (err) {
    res.status(500).json({ error: "Error al generar citas" });
  }
};