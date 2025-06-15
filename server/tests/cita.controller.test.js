jest.mock('../middlewares/autenticarToken', () => (req, res, next) => {
  req.user = { id: 1 };
  next();
});

const request = require('supertest');
const app = require('../app');
const { db } = require('../db/db.config');
jest.mock('../db/db.config');

describe('CitaController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /citas/crear', () => {
    it('debe crear citas correctamente', async () => {
      db.promise = () => ({
        query: jest.fn().mockResolvedValue([[]])
      });
      const token = 'Bearer testtoken';
      const res = await request(app)
        .post('/citas/crear')
        .set('Authorization', token)
        .send({ fechas: [new Date().toISOString()], idBarbero: 1 });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('mensaje');
    });
    it('debe fallar si no tiene permiso', async () => {
      const token = 'Bearer testtoken';
      const res = await request(app)
        .post('/citas/crear')
        .set('Authorization', token)
        .send({ fechas: [new Date().toISOString()], idBarbero: 2 });
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error');
    });
    it('debe fallar si falta información', async () => {
      const token = 'Bearer testtoken';
      const res = await request(app)
        .post('/citas/crear')
        .set('Authorization', token)
        .send({ idBarbero: 1 });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
    it('debe devolver 500 si hay error de base de datos', async () => {
      db.promise = () => ({
        query: jest.fn().mockRejectedValue(new Error('DB error'))
      });
      const token = 'Bearer testtoken';
      const res = await request(app)
        .post('/citas/crear')
        .set('Authorization', token)
        .send({ fechas: [new Date().toISOString()], idBarbero: 1 });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

});
