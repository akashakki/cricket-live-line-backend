const express = require('express');
const { ticketController, ourServicesController} = require('../../controllers');
const adminAuth = require('../../middlewares/adminAuth');
const companyAuth = require('../../middlewares/companyAuth');
const { isAuthenticated } = require('../../middlewares/isAuthenticated');
const validate = require('../../middlewares/validate');
// const { isAdmin } = require('../../middlewares/isAdmin');
const ourServiceValidator=require('../../validations/ourService.validate');

const router = express.Router();

router.post('/createService',adminAuth(),validate(ourServiceValidator.validateCreateService), ourServicesController.createOurService);
router.get('/getService', adminAuth(),validate(ourServiceValidator.validateGetService),ourServicesController.getAllService);
router.post('/updateService', adminAuth(),validate(ourServiceValidator.validateUpdateService), ourServicesController.updateServiceStatus);
router.post('/deleteService', adminAuth(),validate(ourServiceValidator.validateDeleteService), ourServicesController.deleteOurService)

module.exports = router;
