const express = require('express');
const router = express.Router();
const barberoController = require('../controladores/barbero.controller');
const autenticarToken = require('../middlewares/autenticarToken');

router.get('/es-barbero/:id', barberoController.esBarbero);
router.get('/buscar/:query', barberoController.buscarBarberos);
router.get('/random', barberoController.randomBarberos);
router.get('/productos/:username', barberoController.getProductosBarbero);
router.get('/horario', autenticarToken, barberoController.getHorarioBarbero);
router.put('/horario', autenticarToken, barberoController.setHorarioBarbero);

module.exports = router;