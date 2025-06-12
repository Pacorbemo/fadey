const http = require("http");
const app = require("./app");
const socketHandler = require('./socket');
const { db } = require('./db/db.config');
const PORT = 5000;

const server = http.createServer(app);
socketHandler(server, db);

if (require.main === module) {
  server.listen(PORT, () => {
    const address = server.address();
    let host = address.address;
    if (host === '::' || host === '0.0.0.0') host = 'localhost';
    console.log(`Servidor corriendo en http://${host}:${address.port}`);
  });
}

module.exports = app;