const express = require('express');
const router = express.Router();
const productoController = require('../controladores/producto.controller');
const autenticarToken = require('../middlewares/autenticarToken');
const upload = require('../middlewares/fileUpload');

router.get('/barbero/:username', autenticarToken, productoController.getProductosByBarbero);
router.get('/reservados', autenticarToken, productoController.getReservadosByBarbero);

router.post('/', autenticarToken, upload.single('foto'), productoController.addProducto);
router.post('/reservar', autenticarToken, productoController.reservarProducto);
router.post('/marcar-entregado', autenticarToken, productoController.marcarProductoEntregado);

router.put('/:id', autenticarToken, upload.single('foto'), productoController.updateProducto);

module.exports = router;