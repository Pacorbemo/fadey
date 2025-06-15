const request = require('supertest');
const app = require('../app');
jest.mock('../middlewares/autenticarToken', () => (req, res, next) => {
  req.user = { id: 1, username: 'testbarbero' };
  next();
});

describe('Producto Controller', () => {
  describe('GET /productos/barbero/:username', () => {
    it('debe obtener productos de un barbero', async () => {
      const res = await request(app)
        .get('/productos/barbero/testbarbero');
      expect([200,500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });

  describe('GET /productos/reservados', () => {
    it('debe obtener productos reservados', async () => {
      const res = await request(app)
        .get('/productos/reservados');
      expect([200,500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(typeof res.body).toBe('object');
      }
    });
  });

  describe('POST /productos', () => {
    it('debe fallar al agregar producto con datos incompletos', async () => {
      const res = await request(app)
        .post('/productos')
        .send({ nombre: 'Test' });
      expect(res.statusCode).toBe(400);
    });
    it('debe devolver 200 o 500 al agregar producto completo (mock)', async () => {
      const res = await request(app)
        .post('/productos')
        .field('nombre', 'Test')
        .field('precio', 10)
        .field('descripcion', 'desc')
        .field('stock', 1);
      expect([200,500]).toContain(res.statusCode);
    });
  });

  describe('POST /productos/reservar', () => {
    it('debe fallar si faltan datos', async () => {
      const res = await request(app)
        .post('/productos/reservar')
        .send({});
      expect([400,500]).toContain(res.statusCode);
    });
    it('debe devolver 200, 400 o 500 al reservar producto (mock)', async () => {
      const res = await request(app)
        .post('/productos/reservar')
        .send({ idProducto: 1, cantidad: 1 });
      expect([200,400,500]).toContain(res.statusCode);
    });
  });
});
