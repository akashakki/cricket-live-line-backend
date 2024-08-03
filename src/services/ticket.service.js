const { User } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Ticket = require('../models/ticket.model');
const CONSTANT=require('../config/constant')
const { sendTicketConfirmationEmail, sendTicketReplyEmail } = require('../helpers/mailFunctions');

const raiseTicket = async (user,details) => {

    const ticket = {
        user: user._id, 
        ...details
    }
    console.log(ticket);
    const result = await Ticket.create(ticket);

    await sendTicketConfirmationEmail(user.email, user.name, result);

    return {data:result,code:CONSTANT.SUCCESSFUL,message:CONSTANT.TICKET_RAISED};

}

const changeTicketStatus = async (ticketId, updateDetails) => {

    const {status} = updateDetails;
    const updatedTicket = await Ticket.findByIdAndUpdate({_id:ticketId}, { $set:{status:status} }, { new: true });

    if (!updatedTicket) {
        return { data: [], code: CONSTANT.BAD_REQUEST, message: CONSTANT.TICKET_NOT_FOUND };
    }

    return { data: updatedTicket, code: CONSTANT.SUCCESSFUL, message: CONSTANT.TICKET_UPDATED };;

}
const getAllUserTicket = async (user, queryDetails) => {
   
    const { page = 1, limit = 10 } = queryDetails;

    const options = {
        page,
        limit,
    };

    const paginatedTickets = await Ticket.paginate({ user:user._id }, options);

    return {data:paginatedTickets,code:CONSTANT.SUCCESSFUL,message:CONSTANT.TICKET_LIST};
}

const getAllTicket = async (queryDetails) => {
    const { page = 1, limit = 10 } = queryDetails;

    const options = { page,limit, populate: 'user'};

    const paginatedTickets = await Ticket.paginate({}, options);

    
    return {data:paginatedTickets,code:CONSTANT.SUCCESSFUL,message:CONSTANT.TICKET_LIST};
}

const reply = async (ticketId, content,user) => {
    
    const ticket = await Ticket.findByIdAndUpdate(
       { _id:ticketId},
        {
            $push: { userAdminReplies: { userId:user._id, content } },
        },
        { new: true } // Return the updated document
    );

    if (!ticket) {
        return {data:ticket,code:CONSTANT.BAD_REQUEST,message:CONSTANT.TICKET_NOT_FOUND}
    }

    await sendTicketReplyEmail(user.email, user.name, ticket);
    return { data: ticket, code: CONSTANT.SUCCESSFUL, message:CONSTANT.TICKET_REPLY};

}



module.exports = { raiseTicket, changeTicketStatus, getAllUserTicket, getAllTicket, reply };

