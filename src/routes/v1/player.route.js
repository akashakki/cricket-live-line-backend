const express = require('express');
const { adminAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { playerValidation } = require('../../validations');
const { PlayerController } = require('../../controllers');

const router = express.Router();
router
    .route('/')
    .post(adminAuth('create'), validate(playerValidation.create), PlayerController.create)
    .get(adminAuth('gets'), validate(playerValidation.getList), PlayerController.getLists);

router
    .route('/:id')
    .get(adminAuth('get'), validate(playerValidation.getById), PlayerController.getById)
    .patch(adminAuth('updateById'), validate(playerValidation.update), PlayerController.updateById)
    .delete(adminAuth('deleteById'), validate(playerValidation.deleteById), PlayerController.deleteById);

module.exports = router;
