const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketHandler = require('./socket');

const { db } = require('./db/db.config');

const app = express();
const server = http.createServer(app);
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

const authRoutes = require('./routes/auth.routes');
const productoRoutes = require('./routes/producto.routes');
const relacionRoutes = require('./routes/relacion.routes');
const citaRoutes = require('./routes/cita.routes');
const mensajeRoutes = require('./routes/mensaje.routes');
const barberoRoutes = require('./routes/barbero.routes');
const usuarioRoutes = require('./routes/usuario.routes');

app.use('/auth', authRoutes);
app.use('/productos', productoRoutes);
app.use('/relaciones', relacionRoutes);
app.use('/citas', citaRoutes);
app.use('/mensajes', mensajeRoutes);
app.use('/barberos', barberoRoutes);
app.use('/usuarios', usuarioRoutes);

socketHandler(server, db);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});