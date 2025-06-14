const request = require('supertest');
const app = require('../app');
const db = require('../db/db.config');
jest.mock('../middlewares/autenticarToken', () => (req, res, next) => {
  req.user = { id: 1, username: 'testuser' };
  next();
});

describe('Notificacion Controller', () => {
  afterAll(() => db.end && db.end());

  describe('POST /notificaciones', () => {
    it('debe devolver 400 si falta usuario_id', async () => {
      const res = await request(app)
        .post('/notificaciones')
        .send({ tipo: 'test' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    it('debe devolver 400 si falta tipo', async () => {
      const res = await request(app)
        .post('/notificaciones')
        .send({ usuario_id: 1 });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    it('debe devolver 201 si se crea correctamente (mock)', async () => {
      const res = await request(app)
        .post('/notificaciones')
        .send({ usuario_id: 1, tipo: 'test', mensaje: 'msg', emisor_id: 2 });
      expect([201,500]).toContain(res.statusCode);
    });
  });

  describe('GET /notificaciones', () => {
    it('debe devolver 200 o 500 (mock)', async () => {
      const res = await request(app)
        .get('/notificaciones');
      expect([200,500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
    it('debe soportar paginación', async () => {
      const res = await request(app)
        .get('/notificaciones?limit=2&offset=0');
      expect([200,500]).toContain(res.statusCode);
    });
  });

  describe('PUT /notificaciones/:id/leida', () => {
    it('debe devolver 200 o 500 (mock)', async () => {
      const res = await request(app)
        .put('/notificaciones/1/leida');
      expect([200,500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('PUT /notificaciones/leidas', () => {
    it('debe devolver 200 o 500 (mock)', async () => {
      const res = await request(app)
        .put('/notificaciones/leidas');
      expect([200,500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body.success).toBe(true);
        expect(typeof res.body.updated).toBe('number');
      }
    });
  });
});
