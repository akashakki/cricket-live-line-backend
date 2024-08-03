const express = require('express');
const { adminAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { newsValidation } = require('../../validations');
const { NewsController } = require('../../controllers');

const router = express.Router();
router
    .route('/')
    .post(adminAuth('create'), validate(newsValidation.create), NewsController.create)
    .get(adminAuth('gets'), validate(newsValidation.getList), NewsController.getLists);

router
    .route('/:id')
    .get(adminAuth('get'), validate(newsValidation.getById), NewsController.getById)
    .patch(adminAuth('updateById'), validate(newsValidation.update), NewsController.updateById)
    .delete(adminAuth('deleteById'), validate(newsValidation.deleteById), NewsController.deleteById);

module.exports = router;
