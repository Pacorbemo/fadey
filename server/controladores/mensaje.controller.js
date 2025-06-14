const { db } = require('../db/db.config');

exports.obtenerMensajes = (req, res) => {
  const { receptor_id, limit, offset } = req.query;
  const userId = req.user.id;
  const limitNum = Math.max(1, Math.min(parseInt(limit) || 30, 100));
  const offsetNum = Math.max(0, parseInt(offset) || 0);

  const query = `
    SELECT * FROM Mensajes
    WHERE (emisor_id = ? AND receptor_id = ?)
       OR (emisor_id = ? AND receptor_id = ?)
    ORDER BY fecha_envio DESC
    LIMIT ? OFFSET ?
  `;

  db.query(query, [userId, receptor_id, receptor_id, userId, limitNum, offsetNum], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener mensajes" });
    }
    res.status(200).json(results.reverse());
  });
};

exports.obtenerChats = (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT 
      CASE WHEN emisor_id = ? THEN receptor_id ELSE emisor_id END AS usuario_id,
      MAX(fecha_envio) AS ultima_fecha,
      (SELECT mensaje FROM Mensajes m2 WHERE 
        ((m2.emisor_id = ? AND m2.receptor_id = usuario_id) OR (m2.emisor_id = usuario_id AND m2.receptor_id = ?))
        ORDER BY fecha_envio DESC LIMIT 1) AS ultimo_mensaje,
      SUM(CASE WHEN receptor_id = ? AND leido = 0 THEN 1 ELSE 0 END) AS no_leidos
    FROM Mensajes
    WHERE emisor_id = ? OR receptor_id = ?
    GROUP BY usuario_id
    ORDER BY ultima_fecha DESC;
  `;
  
  db.query(query, [userId, userId, userId, userId, userId, userId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener chats" });
    }
    
    const userIds = results.map(chat => chat.usuario_id);
    if (userIds.length > 0) {
      // Modificado para incluir foto_perfil
      const userQuery = "SELECT id, username, foto_perfil FROM Usuarios WHERE id IN (?)";
      db.query(userQuery, [userIds], (err, userResults) => {
        if (err) {
          return res.status(500).json({ error: "Error al obtener usernames" });
        }
        const usernamesMap = userResults.reduce((map, user) => {
          map[user.id] = { username: user.username, foto_perfil: user.foto_perfil };
          return map;
        }, {});
        results.forEach(chat => {
          chat.username = usernamesMap[chat.usuario_id]?.username || null;
          chat.foto_perfil = usernamesMap[chat.usuario_id]?.foto_perfil || null;
        });
        res.status(200).json(results);
      });
    } else {
      res.status(200).json(results);
    }
  });
};

exports.marcarMensajesLeidos = (req, res) => {
  const userId = req.user.id;
  const { emisor_id } = req.body;
  if (!emisor_id) {
    return res.status(400).json({ error: "Falta el emisor_id" });
  }
  const query = `
    UPDATE Mensajes SET leido = 1
    WHERE emisor_id = ? AND receptor_id = ? AND leido = 0
  `;
  db.query(query, [emisor_id, userId], (err) => {
    if (err) {
      return res.status(500).json({ error: "Error al marcar mensajes como leídos" });
    }
    res.json({ ok: true });
  });
};