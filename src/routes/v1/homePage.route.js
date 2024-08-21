const express = require('express');
const validate = require('../../middlewares/validate');
const { MatchController } = require('../../controllers');

const router = express.Router();

router
    .route('/')
    .get(MatchController.getHomeLists)
    // .get(MatchController.getFAQs);

module.exports = router;