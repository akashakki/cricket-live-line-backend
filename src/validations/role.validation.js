const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createRole = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        resource: Joi.array(),
        company: Joi.string().allow('').allow(null),
        isDelete: Joi.number().allow('').allow(null),
    }),
};

const getRoles = {
    query: Joi.object().keys({
        name: Joi.string(),
        role: Joi.string(),
        sortBy: Joi.string(),
        searchBy: Joi.string().allow('').allow(null),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getRole = {
    params: Joi.object().keys({
        roleId: Joi.string().custom(objectId),
    }),
};

const updateRole = {
    params: Joi.object().keys({
        roleId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().required(),
            resource: Joi.array(),
            company: Joi.string().allow('').allow(null),
            status: Joi.number(),
            isDelete: Joi.number().allow('').allow(null),
            createdAt: Joi.date(),
            updatedAt: Joi.date(),
            id: Joi.string()
        })
        .min(1),
};

const deleteRole = {
    params: Joi.object().keys({
        roleId: Joi.string().custom(objectId),
    }),
};

module.exports = {
    createRole,
    getRoles,
    getRole,
    updateRole,
    deleteRole,
};
