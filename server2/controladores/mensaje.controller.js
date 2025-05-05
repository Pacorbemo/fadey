const { db } = require('../db/db.config');

exports.obtenerMensajes = (req, res) => {
  const { emisor_id, receptor_id } = req.query;
  
  const query = `
    SELECT * FROM Mensajes
    WHERE (emisor_id = ? AND receptor_id = ?)
       OR (emisor_id = ? AND receptor_id = ?)
    ORDER BY fecha_envio ASC
  `;
  
  db.query(query, [emisor_id, receptor_id, receptor_id, emisor_id], (err, results) => {
    if (err) {
      console.error("Error al obtener mensajes:", err);
      return res.status(500).json({ error: "Error al obtener mensajes" });
    }
    res.status(200).json(results);
  });
};

exports.obtenerChats = (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT 
      CASE WHEN emisor_id = ? THEN receptor_id ELSE emisor_id END AS usuario_id,
      MAX(fecha_envio) AS ultima_fecha,
      MIN(mensaje) AS ultimo_mensaje
    FROM Mensajes
    WHERE emisor_id = ? OR receptor_id = ?
    GROUP BY usuario_id
    ORDER BY ultima_fecha DESC;
  `;
  
  db.query(query, [userId, userId, userId], (err, results) => {
    if (err) {
      console.error("Error al obtener chats:", err);
      return res.status(500).json({ error: "Error al obtener chats" });
    }
    
    const userIds = results.map(chat => chat.usuario_id);
    if (userIds.length > 0) {
      const userQuery = "SELECT id, username FROM Usuarios WHERE id IN (?)";
      db.query(userQuery, [userIds], (err, userResults) => {
        if (err) {
          console.error("Error al obtener usernames:", err);
          return res.status(500).json({ error: "Error al obtener usernames" });
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
};