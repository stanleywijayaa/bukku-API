const express = require("express");
const router = express.Router();
const quotation = require('../../logics/sales/quotation/quotationLogic')

router.route('/quotation')
    .post(quotation.createQuotation)
    .get()
    .put()
    .patch()
    .delete()

router.route('/salesorder')
    .post()
    .get()
    .put()
    .patch()
    .delete()

router.route('/deliveryorder')
    .post()
    .get()
    .put()
    .patch()
    .delete()

router.route('/invoice')
    .post()
    .get()
    .put()
    .patch()
    .delete()

router.route('/creditnote')
    .post()
    .get()
    .put()
    .patch()
    .delete()

router.route('/payment')
    .post()
    .get()
    .put()
    .patch()
    .delete()

router.route('/refund')
    .post()
    .get()
    .put()
    .patch()
    .delete()

router.use('/all', (() => {
    const allRoute = express.Router()
    allRoute.get('/quotation', quotation.getQuotationList)
    allRoute.get('/salesorder')
    allRoute.get('/deliveryorder')
    allRoute.get('/invoice')
    allRoute.get('/creditnote')
    allRoute.get('/payment')
    allRoute.get('/refund')
    return allRoute
}))

module.exports = router