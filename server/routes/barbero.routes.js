const express = require('express');
const router = express.Router();
const barberoController = require('../controladores/barbero.controller');

router.get('/es-barbero/:id', barberoController.esBarbero);
router.get('/buscar/:query', barberoController.buscarBarberos);
router.get('/random', barberoController.randomBarberos);
router.get('/productos/:username', barberoController.getProductosBarbero);

module.exports = router;