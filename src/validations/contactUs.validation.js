const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createContact = {
    body: Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        phone: Joi.string().allow('').allow(null),
        email: Joi.string().allow('').allow(null),
        subject: Joi.allow('').allow(null),
        message: Joi.allow('').allow(null),
        recaptcha: Joi.allow('').allow(null),
    }),
};

const getContacts = {
    query: Joi.object().keys({
        question: Joi.string(),
        sortBy: Joi.string(),
        searchBy: Joi.string().allow('').allow(null),
        status: Joi.allow('').allow(null),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getContact = {
    params: Joi.object().keys({
        contactId: Joi.string().custom(objectId),
    }),
};

const updateContact = {
    params: Joi.object().keys({
        contactId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().required(),
            email: Joi.string().allow('').allow(null),
            subject: Joi.allow('').allow(null),
            message: Joi.allow('').allow(null),
            status: Joi.allow('').allow(null),
            isDelete: Joi.number().allow('').allow(null),
            createdAt: Joi.date(),
            updatedAt: Joi.date(),
            id: Joi.string(),
            updatedBy: Joi.allow('').allow(null),
            category: Joi.allow('').allow(null),
        })
        .min(1),
};

const deleteContact = {
    params: Joi.object().keys({
        contactId: Joi.string().custom(objectId),
    }),
};

module.exports = {
    createContact,
    getContacts,
    getContact,
    updateContact,
    deleteContact,
};
