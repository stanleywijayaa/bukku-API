const express = require('express');
const router = express.Router();
const OrderController = require('../logics/purchase/orderLogic');
const receivedNotesController = require('../logics/purchase/receivedLogic')
const billsController = require('../logics/purchase/billLogic')
const creditController = require('../logics/purchase/creditLogic')
const paymentController = require('../logics/purchase/paymentLogic')
const refundController = require('../logics/purchase/refundLogic')

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

router.route('/bills')
    .get(billsController.getBillList)
    .post(billsController.createBill)
    .put(billsController.updateBill)
    .patch(billsController.updateBillStatus)
    .delete(billsController.deleteBill)

router.route('/bills/:id')
    .get(billsController.getBill)

router.route('/credit_notes')
    .get(creditController.getCreditList)
    .post(creditController.createCredit)
    .put(creditController.updateCredit)
    .patch(creditController.updateCreditStatus)
    .delete(creditController.deleteCredit)

router.route('/credit_notes/:id')
    .get(creditController.getCredit)

router.route('/payments')
    .get(paymentController.getPaymentList)
    .post(paymentController.createPayment)
    .put(paymentController.updatePayment)
    .patch(paymentController.updatePaymentStatus)
    .delete(paymentController.deletePayment)

router.route('/payments/:id')
    .get(paymentController.getPayment)

router.route('/refunds')
    .get(refundController.getRefundList)
    .post(refundController.createRefund)
    .put(refundController.updateRefund)
    .patch(refundController.updateRefundStatus)
    .delete(refundController.deleteRefund)

router.route('/refunds/:id')
    .get(refundController.getRefund)

module.exports = router;