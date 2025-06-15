const request = require('supertest');
const app = require('../app');
const { db } = require('../db/db.config');
const bcrypt = require('bcrypt');

jest.mock('../db/db.config');

describe('POST /auth/registro', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe registrar un usuario correctamente', async () => {
    db.query
      .mockImplementationOnce((query, params, callback) => {
        callback(null, [{ count: 0 }]);
      })
      .mockImplementationOnce((query, params, callback) => {
        callback(null, [{ count: 0 }]);
      })
      .mockImplementationOnce((query, params, callback) => {
        callback(null, { insertId: 1 });
      });

    const usuario = {
      nombre: 'Test User',
      username: 'testuser',
      barbero: false,
      email: 'test@example.com',
      password: '123456'
    };

    const res = await request(app)
      .post('/auth/registro')
      .send(usuario);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      email: usuario.email,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: 'cliente'
    });
    // El id puede no estar presente en la respuesta, así que no lo comprobamos estrictamente
  });

  it('debe fallar si falta el nombre', async () => {
    const usuario = {
      username: 'testuser',
      barbero: false,
      email: 'test@example.com',
      password: '123456'
    };
    const res = await request(app)
      .post('/auth/registro')
      .send(usuario);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body.mensaje).toMatch(/información insuficiente/i);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('debe fallar si la contraseña es demasiado corta', async () => {
    const usuario = {
      nombre: 'Test User',
      username: 'testuser',
      barbero: false,
      email: 'test@example.com',
      password: '123' // menos de 6 caracteres
    };
    const res = await request(app)
      .post('/auth/registro')
      .send(usuario);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body.mensaje).toMatch(/contraseña.*6.*32/i);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('debe fallar si el campo barbero no es booleano', async () => {
    const usuario = {
      nombre: 'Test User',
      username: 'testuser',
      barbero: 'no', // no booleano
      email: 'test@example.com',
      password: '123456'
    };
    const res = await request(app)
      .post('/auth/registro')
      .send(usuario);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body.mensaje).toMatch(/barbero.*booleano/i);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('debe fallar si el nombre es demasiado largo', async () => {
    const usuario = {
      nombre: 'A'.repeat(51),
      username: 'testuser',
      barbero: false,
      email: 'test@example.com',
      password: '123456'
    };
    const res = await request(app)
      .post('/auth/registro')
      .send(usuario);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body.mensaje).toMatch(/nombre.*50.*caracteres/i);
    expect(db.query).not.toHaveBeenCalled();
  });
});

describe('POST /auth/login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe fallar si falta el username', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ password: '123456' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body.mensaje).toMatch(/debes rellenar todos los campos/i);
    expect(db.query).not.toHaveBeenCalled();
  });
});

