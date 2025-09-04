const express = require('express');
const router = express.Router();
const accountController = require('../../logics/accounting/accountLogic');

router.route('/')
    .get(accountController.getAccountList)
    .post()
    .put()
    .patch()
    .delete()

router.route('/:id')
    .get(accountController.getAccount)