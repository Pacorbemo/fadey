jest.mock('../middlewares/autenticarToken', () => (req, res, next) => {
  req.user = { id: 1 };
  next();
});

const request = require('supertest');
const app = require('../app');
const { db } = require('../db/db.config');
jest.mock('../db/db.config');

describe('MensajeController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /mensajes', () => {
    it('debe devolver mensajes correctamente', async () => {
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [
          { id: 1, emisor_id: 1, receptor_id: 2, mensaje: 'Hola', fecha_envio: new Date(), leido: 0 },
          { id: 2, emisor_id: 2, receptor_id: 1, mensaje: 'Qué tal', fecha_envio: new Date(), leido: 1 }
        ]);
      });
      const res = await request(app).get('/mensajes').query({ receptor_id: 2 });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
    it('debe devolver 500 si hay error de base de datos', async () => {
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('DB error'));
      });
      const res = await request(app).get('/mensajes').query({ receptor_id: 2 });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/obtener mensajes/i);
    });
  });

  describe('GET /mensajes/chats', () => {
    it('debe devolver chats correctamente', async () => {
      db.query
        .mockImplementationOnce((query, params, callback) => {
          callback(null, [
            { usuario_id: 2, ultima_fecha: new Date(), ultimo_mensaje: 'Hola', no_leidos: 1 }
          ]);
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(null, [
            { id: 2, username: 'usuario2', foto_perfil: '' }
          ]);
        });
      const res = await request(app).get('/mensajes/chats');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('username', 'usuario2');
    });
    it('debe devolver 500 si hay error de base de datos', async () => {
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('DB error'));
      });
      const res = await request(app).get('/mensajes/chats');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/obtener chats/i);
    });
  });

  describe('POST /mensajes/marcar-leidos', () => {
    it('debe marcar mensajes como leídos correctamente', async () => {
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null);
      });
      const res = await request(app)
        .post('/mensajes/marcar-leidos')
        .send({ emisor_id: 2 });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('ok', true);
    });
    it('debe devolver 400 si falta el emisor_id', async () => {
      const res = await request(app)
        .post('/mensajes/marcar-leidos')
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/falta el emisor_id/i);
    });
    it('debe devolver 500 si hay error de base de datos', async () => {
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('DB error'));
      });
      const res = await request(app)
        .post('/mensajes/marcar-leidos')
        .send({ emisor_id: 2 });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/marcar mensajes como leídos/i);
    });
  });
});
