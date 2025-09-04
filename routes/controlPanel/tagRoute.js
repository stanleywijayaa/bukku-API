const express = require('express');
const router = express.Router();
const tagController = require('../../logics/controlPanel/tagLogic');

router.route('/')
    .get(tagController.getTagList)
    .post(tagController.createTag)
    .put(tagController.updateTag)
    .delete(tagController.deleteTag)

router.route('/:id')
    .get(tagController.createTag)

router.route('/1')
    .get()
    .post()
    .put()
    .patch()
    .delete()

router.route('/1/:id')
    .get()