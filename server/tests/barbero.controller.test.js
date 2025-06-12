const request = require('supertest');
const app = require('../app');
const { db } = require('../db/db.config');
jest.mock('../db/db.config');

describe('BarberoController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /barberos/es-barbero/:id', () => {
    it('debe devolver el campo barbero si el usuario existe', async () => {
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ barbero: 1 }]);
      });
      const res = await request(app).get('/barberos/es-barbero/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('barbero', 1);
      expect(db.query).toHaveBeenCalledTimes(1);
    });
    it('debe devolver 404 si el usuario no existe', async () => {
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });
      const res = await request(app).get('/barberos/es-barbero/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/usuario no encontrado/i);
    });
    it('debe devolver 500 si hay error de base de datos', async () => {
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('DB error'));
      });
      const res = await request(app).get('/barberos/es-barbero/1');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/buscar el usuario/i);
    });
  });

  describe('GET /barberos/buscar/:query', () => {
    it('debe devolver una lista de barberos', async () => {
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [
          { id: 1, username: 'barbero1', nombre: 'Barbero Uno', foto_perfil: '' },
          { id: 2, username: 'barbero2', nombre: 'Barbero Dos', foto_perfil: '' }
        ]);
      });
      const res = await request(app).get('/barberos/buscar/test');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
    it('debe devolver 404 si falta el parámetro de búsqueda', async () => {
      const res = await request(app).get('/barberos/buscar/');
      expect(res.statusCode).toBe(404); // Express no matchea la ruta sin param
    });
    it('debe devolver 500 si hay error de base de datos', async () => {
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('DB error'));
      });
      const res = await request(app).get('/barberos/buscar/test');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/buscar barberos/i);
    });
  });

  describe('GET /barberos/random', () => {
    it('debe devolver una lista de barberos aleatorios', async () => {
      db.query.mockImplementationOnce((query, callback) => {
        callback(null, [
          { id: 1, username: 'barbero1', nombre: 'Barbero Uno', foto_perfil: '' }
        ]);
      });
      const res = await request(app).get('/barberos/random');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    it('debe devolver 500 si hay error de base de datos', async () => {
      db.query.mockImplementationOnce((query, callback) => {
        callback(new Error('DB error'));
      });
      const res = await request(app).get('/barberos/random');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/barberos aleatorios/i);
    });
  });
});
