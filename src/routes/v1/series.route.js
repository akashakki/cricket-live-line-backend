const express = require('express');
const { adminAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { seriesValidation } = require('../../validations');
const { SeriesController } = require('../../controllers');

const router = express.Router();
router
    .route('/')
    .post(adminAuth('create'), validate(seriesValidation.create), SeriesController.create)
    .get(adminAuth('gets'), validate(seriesValidation.getList), SeriesController.getLists);

router
    .route('/:id')
    .get(adminAuth('get'), validate(seriesValidation.getById), SeriesController.getById)
    .patch(adminAuth('updateById'), validate(seriesValidation.update), SeriesController.updateById)
    .delete(adminAuth('deleteById'), validate(seriesValidation.deleteById), SeriesController.deleteById);

module.exports = router;
