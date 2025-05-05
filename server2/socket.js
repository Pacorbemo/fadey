const { Server } = require('socket.io');

module.exports = (server, db) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  const users = {}; 

  io.on('connection', (socket) => {

    socket.on('registro', (userId) => {
      users[userId] = socket.id;
    });

    socket.on('enviarMensaje', async ({ emisor_id, receptor_id, mensaje }) => {
      try {
        const query = "INSERT INTO Mensajes (emisor_id, receptor_id, mensaje) VALUES (?, ?, ?)";
        db.query(query, [emisor_id, receptor_id, mensaje], (err, result) => {
          if (err) {
            console.error('Error al guardar el mensaje:', err);
            return;
          }

          io.to(users[receptor_id]).emit('nuevoMensaje', { emisor_id, mensaje, fecha_envio: new Date() });
        });
      } catch (error) {
        console.error('Error al procesar el mensaje:', error);
      }
    });

    socket.on('disconnect', () => {
      for (const id in users) {
        if (users[id] === socket.id) delete users[id];
      }
    });
  });
};