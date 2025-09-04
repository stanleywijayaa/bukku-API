const express = require('express');
const router = express.Router();
const tagController = require('../../logics/controlPanel/tagLogic');
const tagGController = require('../../logics/controlPanel/tagGroupLogic')

router.route('/')
    .get(tagController.getTagList)
    .post(tagController.createTag)
    .put(tagController.updateTag)
    .delete(tagController.deleteTag)

router.route('/:id')
    .get(tagController.createTag)

router.route('/groups')
    .get(tagGController.getTagGroupList)
    .post()
    .put()
    .patch()
    .delete()

router.route('/groups/:id')
    .get()