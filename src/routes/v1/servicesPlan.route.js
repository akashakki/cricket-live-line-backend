const express = require('express');
const { ticketController, ourServicesController, servicePlanController} = require('../../controllers');
const adminAuth = require('../../middlewares/adminAuth');
const companyAuth = require('../../middlewares/companyAuth');
const servicePlanValidator = require('../../validations/servicePlan.validate');
const validate = require('../../middlewares/validate');
// const { isAdmin } = require('../../middlewares/isAdmin');

const router = express.Router();

router.post('/createPlan',adminAuth(),validate(servicePlanValidator.validateCreatePlan), servicePlanController.createPlan);
router.post('/updatePlan', adminAuth(),validate(servicePlanValidator.validateUpdatePlan), servicePlanController.updatePlan);
router.post('/updateAndGrantPlan', adminAuth(),validate(servicePlanValidator.validateUpdatePlanGrantAccess), servicePlanController.updateAndGrantAccess);
router.get('/getPlan', adminAuth(),validate(servicePlanValidator.validateGetPlan), servicePlanController.getAllPlanAdmin);
router.post('/deletePlan', adminAuth(), validate(servicePlanValidator.validateDeletePlan),servicePlanController.deleteServicePlan);

// below route for normal user
router.get('/getPlanUser',validate(servicePlanValidator.validateGetPlan), companyAuth(),servicePlanController.getAllPlan);

module.exports = router;
