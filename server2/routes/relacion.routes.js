const express = require('express');
const router = express.Router();
const relacionController = require('../controladores/relacion.controller');
const autenticarToken = require('../middlewares/autenticarToken');

router.get('/', autenticarToken, relacionController.getRelaciones);
router.get('/cliente', autenticarToken, relacionController.getRelacionesCliente);
router.get('/barbero', autenticarToken, relacionController.getRelacionesBarbero);
router.post('/aceptar', autenticarToken, (req, res) => relacionController.actualizarSolicitud(req, res, 'aceptado'));
router.post('/rechazar', autenticarToken, (req, res) => relacionController.actualizarSolicitud(req, res, 'rechazado'));
router.post('/eliminar', autenticarToken, relacionController.eliminarRelacion);
router.post('/solicitar', autenticarToken, relacionController.solicitarRelacion);
router.get('/comprobar', autenticarToken, relacionController.comprobarRelacion);

module.exports = router;