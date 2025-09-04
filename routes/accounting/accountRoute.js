const express = require('express');
const router = express.Router();
const accountController = require('../../logics/accounting/accountLogic');

router.route('/')
    .get(accountController.getAccountList)
    .post(accountController.createAccount)
    .put(accountController.updateAccount)
    .patch()
    .delete()

router.route('/:id')
    .get(accountController.getAccount)