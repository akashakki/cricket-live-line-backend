const express = require('express');
const { adminAuth, basicAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { contactValidation } = require('../../validations');
const { ContactUsController } = require('../../controllers');

const router = express.Router();

router
    .route('/')
    .post(basicAuth('createContact'), validate(contactValidation.createContact), ContactUsController.createContact)
    .get(adminAuth('getContacts'), validate(contactValidation.getContacts), ContactUsController.getContacts);

router
    .route('/:contactId')
    .get(adminAuth('getContact'), validate(contactValidation.getContact), ContactUsController.getContact)
    .patch(adminAuth('updateContact'), validate(contactValidation.updateContact), ContactUsController.updateContact)
    .delete(adminAuth('deleteContact'), validate(contactValidation.deleteContact), ContactUsController.deleteContact);

module.exports = router;