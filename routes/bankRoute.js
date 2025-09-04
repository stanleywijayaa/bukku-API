const express = require('express');
const router = express.Router();
const moneyInController = require('../logics/bank/moneyInLogic')
const moneyOutController = require('../logics/bank/moneyOutLogic')
const transfersController = require('../logics/bank/transfersLogic')

router.route('/incomes')
    .post(moneyInController.createMoneyIn)
    .get(moneyInController.getMoneyInList)
    .put(moneyInController.updateMoneyIn)
    .patch(moneyInController.updateMoneyInStatus)
    .delete(moneyInController.deleteMoneyIn)

router.route('/expenses')
    .post(moneyOutController.createMoneyOut)
    .get(moneyOutController.getMoneyOutList)
    .put(moneyOutController.updateMoneyOut)
    .patch(moneyOutController.updateMoneyOutStatus)
    .delete(moneyOutController.deleteMoneyOut)

router.route('/transfers')
    .post(transfersController.createTransaction)
    .get(transfersController.getTransferList)
    .put(transfersController.updateTransfer)
    .patch(transfersController.updateTransferStatus)
    .delete(transfersController.deleteTransfer)

router.route('/incomes/:id')
    .get(moneyInController.getMoneyIn)

router.route('/expenses/:id')
    .get(moneyOutController.getMoneyOut)

router.route('/transfers/:id')
    .get(transfersController.getTransfer)