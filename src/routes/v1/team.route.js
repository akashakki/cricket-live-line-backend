const express = require('express');
const { adminAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { teamValidation } = require('../../validations');
const { TeamController } = require('../../controllers');

const router = express.Router();
router
    .route('/')
    .post(adminAuth('create'), validate(teamValidation.create), TeamController.create)
    .get(adminAuth('gets'), validate(teamValidation.getList), TeamController.getLists);

router
    .route('/:id')
    .get(adminAuth('get'), validate(teamValidation.getById), TeamController.getById)
    .patch(adminAuth('updateById'), validate(teamValidation.update), TeamController.updateById)
    .delete(adminAuth('deleteById'), validate(teamValidation.deleteById), TeamController.deleteById);

module.exports = router;
