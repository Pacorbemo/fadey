const express = require('express');
const router = express.Router();
const usuarioController = require('../controladores/usuario.controller');

router.get('/username/:username', usuarioController.usuarioExiste);
router.get('/email/:email', usuarioController.emailExiste);
router.get('/telefono/:telefono', usuarioController.telefonoExiste);

module.exports = router;