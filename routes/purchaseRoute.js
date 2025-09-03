const express = require('express');
const router = express.Router();
const OrderController = require('../logics/purchase/orderLogic');
const receivedNotesController = require('../logics/purchase/receivedLogic')
const billsController = require('../logics/purchase/billLogic')
const creditController = require('../logics/purchase/creditLogic')

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
    .post(billsController.createBill)
    .put(billsController.updateBill)
    .patch(billsController.updateBillStatus)
    .delete(billsController.deleteBill)

router.route('/goods/:id')
    .get(billsController.getBill)

router.route('/credit_notes')
    .get(creditController.getCreditList)
    .post(creditController.createCredit)
    .put(creditController.updateCredit)
    .patch()
    .delete()

router.route('/credit_notes/:id')
    .get(creditController.getCredit)
module.exports = router;