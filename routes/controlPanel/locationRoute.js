const express = require('express');
const router = express.Router();
const locationController = require('../../logics/controlPanel/locationLogic');

router.route('/')
    .get(locationController.getLocationList)
    .post(locationController.createLocation)
    .put(locationController.updateLocation)
    .patch()
    .delete()

router.route('/:id')
    .get(locationController.getLocation)