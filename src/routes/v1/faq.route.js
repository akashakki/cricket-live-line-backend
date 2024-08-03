const express = require('express');
const { adminAuth, basicAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { faqValidation } = require('../../validations');
const { FAQController } = require('../../controllers');

const router = express.Router();

router
    .route('/')
    .post(adminAuth('createFAQ'), validate(faqValidation.createFAQ), FAQController.createFAQ)
    .get(adminAuth('getFAQs'), validate(faqValidation.getFAQs), FAQController.getFAQs);

router
    .route('/:faqId')
    .get(adminAuth('getFAQ'), validate(faqValidation.getFAQ), FAQController.getFAQ)
    .patch(adminAuth('updateFAQ'), validate(faqValidation.updateFAQ), FAQController.updateFAQ)
    .delete(adminAuth('deleteFAQ'), validate(faqValidation.deleteFAQ), FAQController.deleteFAQ);

router
    .route('/list/dropdown')
    .get(adminAuth('getFAQsWithoutPagination'), FAQController.getFAQsWithoutPagination);

    router
    .route('/for/user')
    .get(basicAuth('getFAQsWithoutPagination'), FAQController.getFAQsWithoutPagination);

module.exports = router;