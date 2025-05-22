const express = require('express');
const router = express.Router();
const usuarioController = require('../controladores/usuario.controller');
const upload = require('../middlewares/fileUpload');
const autenticarToken = require('../middlewares/autenticarToken');

router.get('/username/:username', usuarioController.usuarioExiste);
router.get('/email/:email', usuarioController.emailExiste);
router.get('/telefono/:telefono', usuarioController.telefonoExiste);
router.put('/imagen-perfil', autenticarToken, upload.single('imagen'), usuarioController.putImagenPerfil);

module.exports = router;