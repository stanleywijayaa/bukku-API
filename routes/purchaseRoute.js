const express = require('express');
const router = express.Router();
const productOrderController = require('../logics/purchase/OrderLogic');

router.route('/orders')
    .get(productOrderController.getOrderList)
    // .post(productAttributesController.createProductAttribute)
    // .put(productAttributesController.updateProductAttribute)
    // .delete(productAttributesController.deleteProductAttribute)

router.route('/orders/:id')
    .get(productOrderController.getOrder)

// router.route('/batch')
//     .post(productAttributesController.batchProductAttribute)

module.exports = router;