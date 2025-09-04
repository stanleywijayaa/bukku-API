const express = require("express");
const router = express.Router();
const sales = require('../logics/sales/salesLogic')

//Sales route with id
router.route('/:type/:transactionId')
    .get(sales.getSales)
    .put(sales.updateSales)
    .patch(sales.patchSales)
    .delete(sales.deleteSales)

//Sales route without id
router.route(`/:type`)
    .post(sales.createSales)
    .get(sales.getSalesList)

module.exports = router