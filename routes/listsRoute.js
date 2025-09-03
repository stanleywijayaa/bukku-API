const express = require("express");
const router = express.Router();
const listsController = require('../logics/lists/listsLogic');

router.route('/')
    .post(listsController.getLists)

module.exports = router