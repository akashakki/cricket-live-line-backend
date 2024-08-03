const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createFAQ = {
    body: Joi.object().keys({
        question: Joi.string().required(),
        answer: Joi.string().allow('').allow(null),
        createdBy: Joi.allow('').allow(null),
        updatedBy: Joi.allow('').allow(null),

    }),
};

const getFAQs = {
    query: Joi.object().keys({
        question: Joi.string(),
        sortBy: Joi.string(),
        searchBy: Joi.string().allow('').allow(null),
        status: Joi.allow('').allow(null),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getFAQ = {
    params: Joi.object().keys({
        faqId: Joi.string().custom(objectId),
    }),
};

const updateFAQ = {
    params: Joi.object().keys({
        faqId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            question: Joi.string().required(),
            answer: Joi.string().allow('').allow(null),
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

const deleteFAQ = {
    params: Joi.object().keys({
        faqId: Joi.string().custom(objectId),
    }),
};

module.exports = {
    createFAQ,
    getFAQs,
    getFAQ,
    updateFAQ,
    deleteFAQ,
};
