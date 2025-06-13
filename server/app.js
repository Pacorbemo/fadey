const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { corsOptions, limiter } = require('./config/serverConfig');

const app = express();

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(limiter);

const authRoutes = require('./routes/auth.routes');
const productoRoutes = require('./routes/producto.routes');
const relacionRoutes = require('./routes/relacion.routes');
const citaRoutes = require('./routes/cita.routes');
const mensajeRoutes = require('./routes/mensaje.routes');
const barberoRoutes = require('./routes/barbero.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const notificacionRoutes = require('./routes/notificacion.routes');

app.use('/auth', authRoutes);
app.use('/productos', productoRoutes);
app.use('/relaciones', relacionRoutes);
app.use('/citas', citaRoutes);
app.use('/mensajes', mensajeRoutes);
app.use('/barberos', barberoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/notificaciones', notificacionRoutes);

app.use((err, req, res, next) => {
  if (err instanceof Error && err.message && err.message.includes('Solo se permiten imágenes')) {
    return res.status(400).json({ mensaje:'Sube una imagen en formato JPEG, PNG o WEBP.' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ mensaje: 'La imagen es demasiado grande', sugerencia: 'El tamaño máximo es 5MB.' });
  }
  return res.status(500).json({ mensaje: 'Error interno del servidor', sugerencia: err.message });
});

module.exports = app;
