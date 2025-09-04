const express = require("express");
const router = express.Router();
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