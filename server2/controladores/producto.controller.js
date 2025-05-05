const { db } = require('../db/db.config');

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
      console.error("Error al obtener productos:", err);
      return res.status(500).json({ error: "Error al obtener productos del barbero" });
    }
    res.status(200).json(results);
  });
};

exports.addProducto = (req, res) => {
  const { nombre, precio, descripcion, stock } = req.body;
  const foto = req.file;
  const barbero_id = req.user.id;
  
  if (!nombre || !precio || !descripcion || !stock) {
    return res.status(400).json({ error: "Información insuficiente" });
  }
  
  let foto_url = null;
  if (foto) {
    foto_url = `${req.protocol}://${req.get('host')}/uploads/${foto.filename}`;
  }
  
  const query = `
    INSERT INTO Productos (nombre, precio, descripcion, foto, stock, barbero_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [nombre, precio, descripcion, foto_url, stock, barbero_id], (err, result) => {
    if (err) {
      console.error("Error al agregar producto:", err);
      return res.status(500).json({ error: "Error al agregar producto" });
    }
    res.status(200).json({ message: "Producto agregado exitosamente" });
  });
};

exports.updateProducto = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const barbero_id = req.user.id;

  if (req.file) {
    const foto_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    updates.foto = foto_url;
  }
  
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No se proporcionaron datos para actualizar" });
  }
  
  const query = `
    UPDATE Productos 
    SET ${Object.keys(updates).map(key => `${key} = ?`).join(', ')}
    WHERE id = ? AND barbero_id = ?
  `;
  
  db.query(query, [...Object.values(updates), id, barbero_id], (err, result) => {
    if (err) {
      console.error("Error al actualizar producto:", err);
      return res.status(500).json({ error: "Error al actualizar el producto" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado o no autorizado" });
    }
    if(updates.foto){
      res.status(200).json({ message: "Producto actualizado correctamente", foto_url: updates.foto });
    }
    else{
      res.status(200).json({ message: "Producto actualizado correctamente" });
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
      console.error('Error al comprobar el producto:', err);
      return res.status(500).json({ error: 'Error al comprobar el producto' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'El producto no está disponible o no existe' });
    }

    // Verificar si ya existe una reserva para este cliente y producto
    db.query(selectQuery, [idCliente, idProducto], (err, results) => {
      if (err) {
        console.error('Error al comprobar la reserva:', err);
        return res.status(500).json({ error: 'Error al comprobar la reserva' });
      }

      if (results.length > 0) {
        // Ya existe reserva: se debe restar del stock la cantidad adicional solicitada
        db.query(updateQuery, [cantidad, idProducto, cantidad], (err, resultStock) => {
          if (err) {
            console.error('Error al actualizar stock del producto:', err);
            return res.status(500).json({ error: 'Error al actualizar stock del producto' });
          }
          db.query(updateReservaQuery, [cantidad, idCliente, idProducto], (err, result) => {
            if (err) {
              console.error('Error al actualizar la reserva:', err);
              return res.status(500).json({ error: 'Error al actualizar la reserva' });
            }
            res.status(200).json({ message: 'Reserva actualizada correctamente' });
          });
        });
      } else {
        // Primera reserva: se resta 1 del stock, sin importar la cantidad solicitada,
        // pero se registra la cantidad solicitada en la reserva
        db.query(updateQuery, [1, idProducto, 1], (err, result) => {
          if (err) {
            console.error('Error al reservar el producto:', err);
            return res.status(500).json({ error: 'Error al reservar el producto' });
          }
          db.query(insertQuery, [idCliente, idProducto, cantidad], (err, result) => {
            if (err) {
              console.error('Error al insertar la reserva:', err);
              return res.status(500).json({ error: 'Error al insertar la reserva' });
            }
            res.status(200).json({ message: 'Reserva realizada correctamente' });
          });
        });
      }
    });
  });
};