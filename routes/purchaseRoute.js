const express = require('express');
const router = express.Router();
const productOrderController = require('../logics/purchase/OrderLogic');
const receivedNotesController = require('../logics/purchase/ReceivedLogic')

router.route('/orders')
    .get(productOrderController.getOrderList)
    .post(productOrderController.createOrder)
    .put(productOrderController.updateOrder)
    .patch(productOrderController.updateOrderStatus)
    .delete(productOrderController.deleteOrder)

router.route('/orders/:id')
    .get(productOrderController.getOrder)

router.route('/goods_received_notes')
    .get(receivedNotesController.getReceivedList)
    .post(receivedNotesController.createReceived)
    .put(receivedNotesController.updateReceived)
    .patch(receivedNotesController.updateReceivedStatus)
    .delete(receivedNotesController.deleteReceived)

router.route('/goods_received_notes/:id')
    .get(receivedNotesController.getReceived)


module.exports = router;