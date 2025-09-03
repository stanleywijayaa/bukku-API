const express = require("express");
const router = express.Router();
//const quotation = require('../../logics/sales/quotationLogic');
const sales = require('../logics/sales/salesLogic')

//Sales route
router.route('/:type')
    .post(sales.createSales)
    .get(sales.getSales)
    .put(sales.updateSales)
    .patch(sales.patchSales)
    .delete(sales.deleteSales)

router.get(`/all/:type`, sales.getSalesList)

module.exports = router

/*
//Quotation route
router.route('/quotation')
    .post(quotation.createQuotation)
    .get(quotation.getQuotation)
    .put(quotation.updateQuotation)
    .patch(quotation.patchQuotation)
    .delete(quotation.deleteQuotation)

//Sales Order route
router.route('/salesorder')
    .post()
    .get()
    .put()
    .patch()
    .delete()

//Delivery Order route
router.route('/deliveryorder')
    .post()
    .get()
    .put()
    .patch()
    .delete()

//Invoice route
router.route('/invoice')
    .post()
    .get()
    .put()
    .patch()
    .delete()

//Credit Note route
router.route('/creditnote')
    .post()
    .get()
    .put()
    .patch()
    .delete()

//Payment route
router.route('/payment')
    .post()
    .get()
    .put()
    .patch()
    .delete()

//Refund route
router.route('/refund')
    .post()
    .get()
    .put()
    .patch()
    .delete()

//List subroute
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
*/