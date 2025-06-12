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

module.exports = app;
