const express = require('express');
const { adminAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { disposableEmailValidation } = require('../../validations');
const { DisposableEmailController } = require('../../controllers');

const router = express.Router();
router
    .route('/')
    .post(adminAuth('create'), validate(disposableEmailValidation.create), DisposableEmailController.create)
    .get(adminAuth('gets'), validate(disposableEmailValidation.getList), DisposableEmailController.getList);

router
    .route('/:id')
    .get(adminAuth('get'), validate(disposableEmailValidation.getById), DisposableEmailController.getById)
    .patch(adminAuth('updateById'), validate(disposableEmailValidation.update), DisposableEmailController.updateById)
    .delete(adminAuth('deleteById'), validate(disposableEmailValidation.deleteById), DisposableEmailController.deleteById);

module.exports = router;
