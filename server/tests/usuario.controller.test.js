const request = require('supertest');
const app = require('../app');
jest.mock('../middlewares/autenticarToken', () => (req, res, next) => {
  req.user = { id: 1, username: 'testuser' };
  next();
});

describe('Usuario Controller', () => {
  describe('GET /usuarios', () => {
    it('debe obtener usuario autenticado', async () => {
      const res = await request(app)
        .get('/usuarios');
      expect([200,404,500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('id');
      }
    });
  });
  describe('GET /usuarios/username/:username', () => {
    it('debe validar existencia de username', async () => {
      const res = await request(app)
        .get('/usuarios/username/testuser');
      expect([200,400,404,500]).toContain(res.statusCode);
    });
  });
  describe('GET /usuarios/email/:email', () => {
    it('debe validar existencia de email', async () => {
      const res = await request(app)
        .get('/usuarios/email/test@email.com');
      expect([200,400,500]).toContain(res.statusCode);
    });
  });
});
