const express = require('express');
const router = express.Router();
const mensajeController = require('../controladores/mensaje.controller');
const autenticarToken = require('../middlewares/autenticarToken');

router.get('/', autenticarToken, mensajeController.obtenerMensajes);
router.get('/chats', autenticarToken, mensajeController.obtenerChats);

module.exports = router;