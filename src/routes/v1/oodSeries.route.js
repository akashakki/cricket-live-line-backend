const express = require('express');
const { validateRequest } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { playerValidation } = require('../../validations');
const { OodSeriesController } = require('../../controllers');

const router = express.Router();
router
    .route('/')
    // .post(validateRequest('create'), validate(playerValidation.create), OodSeriesController.create)
    .get(validateRequest('gets'), validate(playerValidation.getList), OodSeriesController.getLists);

router
    .route('/series-list')
    .get(validateRequest('get'), OodSeriesController.getSeriesList)

router
    .route('/match-session/:match_id')
    .get(validateRequest('get'), OodSeriesController.getSessionByMatchId)

router
    .route('/match-score/:match_id')
    .get(validateRequest('get'), OodSeriesController.getMatchScoreByMatchId)

router
    .route('/:match_id')
    .get(validateRequest('get'), OodSeriesController.getByMatchId)

module.exports = router;
