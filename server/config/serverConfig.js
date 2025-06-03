// server/config/serverConfig.js

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'saltarcargando'],
};

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones
  message: 'Has realizado demasiadas peticiones, intentalo de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  corsOptions,
  limiter
};
