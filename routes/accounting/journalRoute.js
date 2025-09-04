const express = require('express');
const router = express.Router();
const journalController = require('../../logics/accounting/journalLogic');

router.route('/')
    .get(journalController.getJournalList)
    .post(journalController.createJournal)
    .put(journalController.updateJournal)
    .patch(journalController.updateJournalStatus)
    .delete()

router.route('/:id')
    .get(journalController.getJournal)