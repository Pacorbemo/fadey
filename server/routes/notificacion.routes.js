const express = require('express');
const router = express.Router();
const notificacionController = require('../controladores/notificacion.controller');
const autenticarToken = require('../middlewares/autenticarToken');

router.post('/', autenticarToken, notificacionController.crearNotificacion);
router.get('/', autenticarToken, notificacionController.obtenerNotificaciones);
router.put('/:id/leida', autenticarToken, notificacionController.marcarLeida);
router.put('/leidas', autenticarToken, notificacionController.marcarTodasLeidas);

module.exports = router;