const { Server } = require('socket.io');
const usuarioController = require('./controladores/usuario.controller');

let emitirNotificacion = () => {};

function socketHandler(server, db) {
  const io = new Server(server, { cors: { origin: '*' } });
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

  emitirNotificacion = function(usuario_id, tipo, emisor_id, mensaje) {
    if (users[usuario_id]) {
      usuarioController.usuarioExisteById(usuario_id, (err, user) => {
        if (err) {
          return;
        }
        if(user){
          usuarioController.usuarioExisteById(emisor_id, (err, emisor) => {
          if (emisor) 
            io.to(users[usuario_id]).emit('nuevaNotificacion', { tipo, username : emisor.username, mensaje, leida : 0 });
          })
        }
      })
    }
  }
}

module.exports = socketHandler;
module.exports.emitirNotificacion = (...args) => emitirNotificacion(...args);

