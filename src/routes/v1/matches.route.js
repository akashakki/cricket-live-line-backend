const express = require('express');
const { adminAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { matchesValidation } = require('../../validations');
const { MatchController } = require('../../controllers');

const router = express.Router();
router
    .route('/')
    .post(adminAuth('create'), validate(matchesValidation.create), MatchController.create)
    .get(adminAuth('gets'), validate(matchesValidation.getList), MatchController.getLists);

router
    .route('/:id')
    .get(adminAuth('get'), validate(matchesValidation.getById), MatchController.getById)
    .patch(adminAuth('updateById'), validate(matchesValidation.update), MatchController.updateById)
    .delete(adminAuth('deleteById'), validate(matchesValidation.deleteById), MatchController.deleteById);

module.exports = router;
