const https = require("https");
const app = require("./app");
const socketHandler = require('./socket');
const { db } = require('./db/db.config');
const PORT = 5000;
const fs = require("fs");
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/corb3ra.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/corb3ra.com/fullchain.pem')
};

const server = https.createServer(options, app);
socketHandler(server, db);

if (require.main === module) {
  server.listen(PORT, () => {
    const address = server.address();
    let host = address.address;
    if (host === '::' || host === '0.0.0.0') host = 'localhost';
    console.log(`Servidor corriendo en https://${host}:${address.port}`);
  });
}

module.exports = app;