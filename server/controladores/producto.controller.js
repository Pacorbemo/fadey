const { db } = require('../db/db.config');
const crearNotificacion = require('../funciones/notificaciones.functions');

exports.getProductosByBarbero = (req, res) => {
  const { username } = req.params;
  const query = `
    SELECT Productos.id, Productos.nombre, Productos.precio, Productos.descripcion, Productos.foto, Productos.stock 
    FROM Productos 
    JOIN Usuarios ON Productos.barbero_id = Usuarios.id 
    WHERE Usuarios.username = ?
  `;
  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error al obtener productos del barbero" });
    }
    res.status(200).json(results);
  });
};

exports.getReservadosByBarbero = (req, res) => {
  const { username } = req.user;

  const query = `
    SELECT 
      Productos.id AS producto_id, 
      reservas_productos.cantidad, 
      Usuarios.username AS cliente_username
    FROM reservas_productos
    JOIN Productos ON reservas_productos.producto_id = Productos.id
    JOIN Usuarios ON reservas_productos.cliente_id = Usuarios.id
    WHERE Productos.barbero_id = (
      SELECT id FROM Usuarios WHERE username = ?
    ) AND reservas_productos.entregado = 0
  `;

  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error al obtener productos reservados" });
    }

    const reservados = {};
    results.forEach(row => {
      if (!reservados[row.producto_id]) {
        reservados[row.producto_id] = [];
      }
      reservados[row.producto_id].push({
        cantidad: row.cantidad,
        username: row.cliente_username
      });
    });

    res.status(200).json(reservados);
  });
};

exports.addProducto = (req, res) => {
  const { nombre, precio, descripcion, stock } = req.body;
  const barbero_id = req.user.id;
  let foto = null;
  
  if(req.file){
    foto = req.file.filename;
  }
  
  if (!nombre || !precio || !descripcion || !stock) {
    return res.status(400).json({ mensaje: "Información insuficiente" });
  }

  const query = `
    INSERT INTO Productos (nombre, precio, descripcion, foto, stock, barbero_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [nombre, precio, descripcion, foto, stock, barbero_id], (err, result) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error al agregar producto" });
    }
    res.status(200).json({ mensaje: "Producto agregado exitosamente" });
  });
};

exports.updateProducto = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const barbero_id = req.user.id;

  if (req.file) {
    updates.foto = req.file.filename;
  }
  
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ mensaje: "No se proporcionaron datos para actualizar" });
  }
  
  const query = `
    UPDATE Productos 
    SET ${Object.keys(updates).map(key => `${key} = ?`).join(', ')}
    WHERE id = ? AND barbero_id = ?
  `;
  
  db.query(query, [...Object.values(updates), id, barbero_id], (err, result) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error al actualizar el producto" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado o no autorizado" });
    }
    if(updates.foto){
      res.status(200).json({ mensaje: "Producto actualizado correctamente", foto: updates.foto });
    }
    else{
      res.status(200).json({ mensaje: "Producto actualizado correctamente" });
    }
  });
};

exports.reservarProducto = (req, res) => {
  const { idProducto, cantidad } = req.body;
  const idCliente = req.user.id;

  const checkQuery = 'SELECT * FROM Productos WHERE id = ? AND stock > 0';
  const updateQuery = 'UPDATE Productos SET stock = stock - ? WHERE id = ? AND stock >= ?';

  const insertQuery = 'INSERT INTO reservas_productos (cliente_id, producto_id, cantidad) VALUES (?, ?, ?)';
  const updateReservaQuery = 'UPDATE reservas_productos SET cantidad = cantidad + ? WHERE cliente_id = ? AND producto_id = ? AND entregado = 0';
  const selectQuery = 'SELECT * FROM reservas_productos WHERE cliente_id = ? AND producto_id = ? AND entregado = 0';
  
  db.query(checkQuery, [idProducto], (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al comprobar el producto' });
    }

    if (results.length === 0) {
      return res.status(400).json({ mensaje: 'El producto no está disponible o no existe' });
    }
    
    const producto = results[0];
    if (producto.barbero_id === idCliente) {
      return res.status(400).json({ mensaje: 'No puedes reservar tu propio producto' });
    }

    db.query(selectQuery, [idCliente, idProducto], (err, results) => {
      if (err) {
        return res.status(500).json({ mensaje: 'Error al comprobar la reserva' });
      }

      if (results.length > 0) {
        db.query(updateQuery, [cantidad, idProducto, cantidad], (err, resultStock) => {
          if (err) {
            return res.status(500).json({ mensaje: 'Error al actualizar stock del producto' });
          }
          db.query(updateReservaQuery, [cantidad, idCliente, idProducto], (err, result) => {
            if (err) {
              return res.status(500).json({ mensaje: 'Error al actualizar la reserva' });
            }
            res.status(200).json({ mensaje: 'Reserva actualizada correctamente' });
          });
        });
      } else {
        db.query(updateQuery, [1, idProducto, 1], (err, result) => {
          if (err) {
            return res.status(500).json({ mensaje: 'Error al reservar el producto' });
          }
          db.query(insertQuery, [idCliente, idProducto, cantidad], (err, result) => {
            if (err) {
              return res.status(500).json({ mensaje: 'Error al insertar la reserva' });
            }
            res.status(200).json({ mensaje: 'Reserva realizada correctamente' });
          });
        });
      }
      crearNotificacion({
        usuario_id: producto.barbero_id,
        emisor_id: idCliente,
        tipo: 'producto',
        mensaje: JSON.stringify({producto: producto.nombre, cantidad: cantidad}),
      })
    });
  });
};

exports.marcarProductoEntregado = (req, res) => {
  const { producto_id, username } = req.body;
  const barbero_id = req.user.id;
  if (!producto_id || !username) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }
  const getClienteIdQuery = "SELECT id FROM Usuarios WHERE username = ?";
  db.query(getClienteIdQuery, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error al buscar usuario" });
    }
    if (results.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    const cliente_id = results[0].id;
    const checkReservaQuery = `SELECT rp.*, p.nombre as producto_nombre FROM reservas_productos rp JOIN Productos p ON rp.producto_id = p.id WHERE rp.producto_id = ? AND rp.cliente_id = ? AND rp.entregado = 0 AND p.barbero_id = ?`;
    db.query(checkReservaQuery, [producto_id, cliente_id, barbero_id], (err, reservas) => {
      if (err) {
        return res.status(500).json({ mensaje: "Error al comprobar reserva" });
      }
      if (reservas.length === 0) {
        return res.status(404).json({ mensaje: "Reserva no encontrada o ya entregada" });
      }
      const updateQuery = "UPDATE reservas_productos SET entregado = 1, updated_at = NOW() WHERE producto_id = ? AND cliente_id = ? AND entregado = 0";
      db.query(updateQuery, [producto_id, cliente_id], (err, result) => {
        if (err) {
          return res.status(500).json({ mensaje: "Error al marcar como entregado" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ mensaje: "No se pudo marcar como entregado" });
        }
        res.status(200).json({ mensaje: "Producto marcado como entregado" });
      });
    });
  });
};