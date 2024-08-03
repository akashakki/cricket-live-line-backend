const express = require('express');
const { ticketController} = require('../../controllers');
const adminAuth = require('../../middlewares/adminAuth');
const companyAuth = require('../../middlewares/companyAuth');
const { isAuthenticated } = require('../../middlewares/isAuthenticated');
// const { isAdmin } = require('../../middlewares/isAdmin');
const ticketServiceValidator = require('../../validations/ticket.validate');
const validate = require('../../middlewares/validate');

const router = express.Router();

router.post('/createTicket', companyAuth(),validate(ticketServiceValidator.validateCreateTicket), ticketController.createTicket);
router.get('/getUserTicket', companyAuth(),validate(ticketServiceValidator.validateGetTicket), ticketController.getUserTicket);

// bellow routes for admin user 
router.post('/updateStatus',adminAuth(),validate(ticketServiceValidator.validateUpdateTicket), ticketController.updateStatus);
router.get('/getAllTicket', adminAuth(),validate(ticketServiceValidator.validateGetAllTicket), ticketController.getAll);


router.post('/replyTicket',isAuthenticated,validate(ticketServiceValidator.validateReplyTicket), ticketController.replyTicket); //this route is accessible for admin users ans normal users as well


module.exports = router;
