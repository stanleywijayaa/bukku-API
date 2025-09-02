const express = require('express');
const router = express.Router();
const productOrderController = require('../logics/purchase/OrderLogic');

router.route('/orders')
    .get(productOrderController.getOrderList)
    .post(productOrderController.createOrder)
    .put(productOrderController.updateOrder)
    .patch(productOrderController.updateOrderStatus)
    .delete(productOrderController.deleteOrder)

router.route('/orders/:id')
    .get(productOrderController.getOrder)

module.exports = router;