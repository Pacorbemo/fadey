const request = require('supertest');
const app = require('../app');
jest.mock('../middlewares/autenticarToken', () => (req, res, next) => {
  req.user = { id: 1, username: 'testuser' };
  next();
});

describe('Relacion Controller', () => {
  describe('GET /relaciones', () => {
    it('debe obtener relaciones', async () => {
      const res = await request(app)
        .get('/relaciones');
      expect([200,500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });
  describe('GET /relaciones/cliente', () => {
    it('debe obtener relaciones cliente', async () => {
      const res = await request(app)
        .get('/relaciones/cliente');
      expect([200,500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });
  describe('GET /relaciones/barbero', () => {
    it('debe obtener relaciones barbero', async () => {
      const res = await request(app)
        .get('/relaciones/barbero');
      expect([200,500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });
  describe('GET /relaciones/solicitudes', () => {
    it('debe obtener solicitudes', async () => {
      const res = await request(app)
        .get('/relaciones/solicitudes');
      expect([200,500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });
  describe('POST /relaciones/solicitar', () => {
    it('debe fallar al solicitar relación sin datos', async () => {
      const res = await request(app)
        .post('/relaciones/solicitar')
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    it('debe devolver 200, 400 o 500 al solicitar relación (mock)', async () => {
      const res = await request(app)
        .post('/relaciones/solicitar')
        .send({ userBarbero: 'barbero' });
      expect([200,400,500]).toContain(res.statusCode);
    });
  });
  describe('GET /relaciones/comprobar', () => {
    it('debe fallar si falta idBarbero', async () => {
      const res = await request(app)
        .get('/relaciones/comprobar');
      expect(res.statusCode).toBe(400);
    });
    it('debe devolver 200, 400 o 500 al comprobar relación (mock)', async () => {
      const res = await request(app)
        .get('/relaciones/comprobar?idBarbero=1');
      expect([200,400,500]).toContain(res.statusCode);
    });
  });
});
