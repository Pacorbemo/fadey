const express = require('express');
const router = express.Router();
const citaController = require('../controladores/cita.controller');
const autenticarToken = require('../middlewares/autenticarToken');

router.post('/crear', autenticarToken, citaController.crearCitas);
router.post('/confirmar', autenticarToken, citaController.confirmarCita);
router.get('/barbero', autenticarToken, citaController.obtenerCitasBarbero);
router.get('/cliente', autenticarToken, citaController.obtenerCitasCliente);
router.post('/', autenticarToken, citaController.obtenerCitas);
router.get('/proximas', autenticarToken, citaController.obtenerProximasCitas);
router.post('/generar-semana', autenticarToken, citaController.generarCitasSemana);

module.exports = router;