const { Server } = require('socket.io');

module.exports = (server, db) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Permitir todas las conexiones (ajusta según sea necesario)
    },
  });

  io.on('connection', (socket) => {

    // Escuchar mensajes enviados por el cliente
    socket.on('enviarMensaje', async ({ emisor_id, receptor_id, mensaje }) => {
      try {
        // Guardar el mensaje en la base de datos
        const query = "INSERT INTO Mensajes (emisor_id, receptor_id, mensaje) VALUES (?, ?, ?)";
        db.query(query, [emisor_id, receptor_id, mensaje], (err, result) => {
          if (err) {
            console.error('Error al guardar el mensaje:', err);
            return;
          }

          // Emitir el mensaje al receptor
          io.to(receptor_id).emit('nuevoMensaje', { emisor_id, mensaje, fecha_envio: new Date() });
        });
      } catch (error) {
        console.error('Error al procesar el mensaje:', error);
      }
    });

    // Desconexión del usuario
    // socket.on('disconnect', () => {
    //   console.log('Usuario desconectado:', socket.id);
    // });
  });
};