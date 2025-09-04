const express = require('express');
const router = express.Router();
const locationController = require('../../logics/controlPanel/locationLogic');

router.route('/')
    .get(locationController.getLocationList)
    .post()
    .put()
    .patch()
    .delete()

router.route('/:id')
    .get()