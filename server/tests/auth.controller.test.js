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
      id: 1,
      email: usuario.email,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: 'cliente'
    });
  });

  it('debe fallar si el username ya existe', async () => {
    db.query
      .mockImplementationOnce((query, params, callback) => {
        callback(null, [{ count: 1 }]); 
      })

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

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/usuario ya está en uso/i);
    expect(db.query).toHaveBeenCalledTimes(1);
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
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/información insuficiente/i);
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
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/contraseña.*6.*32/i);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('debe fallar si el email ya está en uso', async () => {
    db.query
      .mockImplementationOnce((query, params, callback) => {
        callback(null, [{ count: 0 }]); // username libre
      })
      .mockImplementationOnce((query, params, callback) => {
        callback(null, [{ count: 1 }]); // email ya existe
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
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/email ya está en uso/i);
    expect(db.query).toHaveBeenCalledTimes(2);
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
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/barbero.*booleano/i);
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
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/nombre.*50.*caracteres/i);
    expect(db.query).not.toHaveBeenCalled();
  });
});

describe('POST /auth/login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe loguear correctamente con credenciales válidas', async () => {
    db.query.mockImplementationOnce((query, params, callback) => {
      callback(null, [{
        id: 1,
        username: 'testuser',
        nombre: 'Test User',
        barbero: false,
        password: 'hashedPassword',
        email: 'test@example.com',
        foto_perfil: '',
        bio: '',
        enviar_emails: false,
        email_verificado: true
      }]);
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('username', 'testuser');
  });

  it('debe fallar si falta el username', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ password: '123456' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/información insuficiente/i);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('debe fallar si el usuario no existe', async () => {
    db.query.mockImplementationOnce((query, params, callback) => {
      callback(null, []);
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'nouser', password: '123456' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/usuario no encontrado/i);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('debe fallar si la contraseña es incorrecta', async () => {
    db.query.mockImplementationOnce((query, params, callback) => {
      callback(null, [{
        id: 1,
        username: 'testuser',
        nombre: 'Test User',
        barbero: false,
        password: 'hashedPassword',
        email: 'test@example.com',
        foto_perfil: '',
        bio: '',
        enviar_emails: false,
        email_verificado: true
      }]);
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'wrongpass' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/contraseña incorrecta/i);
    expect(db.query).toHaveBeenCalledTimes(1);
  });
});

