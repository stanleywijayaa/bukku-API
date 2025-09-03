const express = require('express');
const router = express.Router();
const OrderController = require('../logics/purchase/OrderLogic');
const receivedNotesController = require('../logics/purchase/ReceivedLogic')
const billsController = require('../logics/purchase/BillLogic')

router.route('/orders')
    .get(OrderController.getOrderList)
    .post(OrderController.createOrder)
    .put(OrderController.updateOrder)
    .patch(OrderController.updateOrderStatus)
    .delete(OrderController.deleteOrder)

router.route('/orders/:id')
    .get(OrderController.getOrder)

router.route('/goods_received_notes')
    .get(receivedNotesController.getReceivedList)
    .post(receivedNotesController.createReceived)
    .put(receivedNotesController.updateReceived)
    .patch(receivedNotesController.updateReceivedStatus)
    .delete(receivedNotesController.deleteReceived)

router.route('/goods_received_notes/:id')
    .get(receivedNotesController.getReceived)

router.route('/goods')
    .get(billsController.getBillList)

router.route('/goods/:id')
    .get(billsController.getBill)

module.exports = router;