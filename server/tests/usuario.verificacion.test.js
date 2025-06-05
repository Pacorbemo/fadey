const request = require('supertest');
const app = require('../index'); // Asegúrate de exportar tu app de Express en index.js

describe('POST /usuarios/enviar-verificacion-email', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'pitos', password: 'pitos' });
    token = res.body.token;
  });

  it('debe enviar el email de verificación', async () => {
    const res = await request(app)
      .post('/usuarios/enviar-verificacion-email')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Email de verificación enviado/);
  });
});
