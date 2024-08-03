const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, ticketService } = require('../services');

const createTicket = catchAsync(async (req, res) => {
    const user = req.user;
    // const {department,message,priority,subject} = 
  const ticket = await ticketService.raiseTicket(user,req.body);
  res.status(httpStatus.CREATED).send(ticket);
});

const updateStatus = catchAsync(async (req, res) => {
    // console.log("req body: " + req.params.id);
    const { ticketId } = req.query;
    console.log("ticketId: " + ticketId);
    const updateResult = await ticketService.changeTicketStatus(ticketId, req.body);

    res.status(httpStatus.OK).send(updateResult);
});
const getUserTicket = catchAsync(async (req, res) => {
    const user = req.user;
    const result = await ticketService.getAllUserTicket(user, req.query)
    
    res.status(httpStatus.OK).send(result);
});
const getAll = catchAsync(async (req, res) => {
    // console.log("user query:" ,req.query);

    const allTicket = await ticketService.getAllTicket(req.query);

    res.status(httpStatus.OK).send(allTicket)
});

const replyTicket = catchAsync(async(req,res) => {

    const user = req.user;
    const replyResult = await ticketService.reply( req.query.ticketId,  req.body.content,user);

    res.status(httpStatus.OK).send(replyResult);
})


module.exports = {createTicket,updateStatus,getUserTicket,getAll,replyTicket};