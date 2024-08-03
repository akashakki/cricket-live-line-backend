const Joi = require('joi');
const { objectId } = require('./custom.validation');

const validateCreateTicket = {

    body: Joi.object().keys({
        subject: Joi.string().trim().required().min(3).max(255),
        message: Joi.string().trim().required().min(3),
        department: Joi.string().trim().required().min(3).max(255),
        priority: Joi.string().trim().required().valid('low', 'medium', 'high'), // Adjust valid priorities as needed
    })
}

const validateUpdateTicket = {
    query: Joi.object().keys({
        ticketId:Joi.string().trim().custom(objectId),
    }),
    body: Joi.object().keys({
        status:Joi.string().trim().required().valid('open', 'resolved', 'closed'),
    })
}

const validateGetTicket = {
    
}

const validateGetAllTicket = {
    query: Joi.object().keys({
        limit: Joi.number().integer().required(),
        page:Joi.number().integer().required()
    }),
}

const validateReplyTicket = {
    body: Joi.object().keys({
        content: Joi.string().trim().required().min(3).max(255),
    }),
    query: Joi.object().keys({
        ticketId: Joi.string().trim().custom(objectId)
    })

}



module.exports = {validateCreateTicket,validateUpdateTicket,validateGetTicket,validateGetAllTicket,validateReplyTicket};