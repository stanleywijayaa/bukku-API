const express = require('express');
const router = express.Router();
const tagController = require('../../logics/controlPanel/tagLogic');

router.route('/')
    .get(tagController.getTagList)
    .post(tagController.createTag)
    .put()
    .patch()
    .delete()

router.route('/:id')
    .get(tagController.getTag)

router.route('/1')
    .get()
    .post()
    .put()
    .patch()
    .delete()

router.route('/1/:id')
    .get()