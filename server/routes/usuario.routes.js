const express = require('express');
const router = express.Router();
const usuarioController = require('../controladores/usuario.controller');
const upload = require('../middlewares/fileUpload');
const autenticarToken = require('../middlewares/autenticarToken');

router.get('/', autenticarToken, usuarioController.getUsuario);
router.get('/username/:username', usuarioController.usuarioExiste);
router.get('/email/:email', usuarioController.emailExiste);
router.get('/telefono/:telefono', usuarioController.telefonoExiste);
router.put('/imagen-perfil', autenticarToken, upload.single('imagen'), usuarioController.putImagenPerfil);
router.put('/', autenticarToken, usuarioController.editarCampo);
router.put('/password', autenticarToken, usuarioController.cambiarPassword);
router.post('/enviar-verificacion-email', autenticarToken, usuarioController.enviarVerificacionEmail);
router.post('/enviar-confirmacion-eliminacion', autenticarToken, usuarioController.enviarConfirmacionEliminacion);
router.get('/verificar-email/:token', usuarioController.verificarEmail);
router.post('/recuperar-password', usuarioController.recuperarPassword);
router.post('/restablecer-password/:token', usuarioController.restablecerPassword);
router.post('/confirmar-eliminacion', usuarioController.confirmarEliminacion);

module.exports = router;