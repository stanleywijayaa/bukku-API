const express = require('express');
const router = express.Router();
const moneyInController = require('../logics/bank/moneyInLogic')

router.route('/incomes')
    .post(moneyInController.createMoneyIn)
    .get(moneyInController.getMoneyInList)
    .put(moneyInController.updateMoneyIn)
    .patch(moneyInController.updateMoneyInStatus)
    .delete(moneyInController.deleteMoneyIn)

router.route('/incomes/:id')
    .get(moneyInController.getMoneyIn)