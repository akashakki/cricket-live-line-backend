const express = require('express');
const { adminAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { venueValidation } = require('../../validations');
const { VenueController } = require('../../controllers');

const router = express.Router();
router
    .route('/')
    .post(adminAuth('create'), validate(venueValidation.create), VenueController.create)
    .get(adminAuth('gets'), validate(venueValidation.getList), VenueController.getLists);

router
    .route('/:id')
    .get(adminAuth('get'), validate(venueValidation.getById), VenueController.getById)
    .patch(adminAuth('updateById'), validate(venueValidation.update), VenueController.updateById)
    .delete(adminAuth('deleteById'), validate(venueValidation.deleteById), VenueController.deleteById);

module.exports = router;
