const express = require('express');
const { adminAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { sportsValidation } = require('../../validations');
const { SportsController } = require('../../controllers');

const router = express.Router();
router
    .route('/')
    .post(adminAuth('create'), validate(sportsValidation.create), SportsController.create)
    .get(adminAuth('gets'), validate(sportsValidation.getList), SportsController.getLists);

router
    .route('/:id')
    .get(adminAuth('get'), validate(sportsValidation.getById), SportsController.getById)
    .patch(adminAuth('updateById'), validate(sportsValidation.update), SportsController.updateById)
    .delete(adminAuth('deleteById'), validate(sportsValidation.deleteById), SportsController.deleteById);

module.exports = router;
