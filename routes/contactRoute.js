const express = require('express')
const router = express.Router()
const contact = require('../logics/contacts/contactsLogic')

//Groups route using id
router.route('/contacts/groups/:id')
    .get()
    .put()
    .delete()

//Groups route wihtout id
router.route('/contacts/groups')
    .post()
    .get()

//Contacts route using id
router.route('/contacts/:id')
    .get()
    .put()
    .patch()
    .delete()

//Contacts route without id
router.route('/contacts')
    .post()
    .get()

module.exports = router