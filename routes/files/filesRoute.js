const express = require("express");
const multer = require("multer");
const filesController = require("../..logics/files/filesLogic");
const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.route('/upload')
    .post(upload.single('file'), filesController.uploadFile);

router.route('/')
    .get(filesController.readFileLists);

router.route('/:id')
    .get(filesController.readFile);

module.exports = router;