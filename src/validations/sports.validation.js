const Joi = require('joi');
const { objectId } = require('./custom.validation');

const create = {
    body: Joi.object().keys({
        sport_id: Joi.string().required(),
        name: Joi.string().required(),
        sort_order: Joi.allow('').allow(null),
    }),
};
const getList = {
    query: Joi.object().keys({
        sortBy: Joi.string(),
        searchBy: Joi.string().allow('').allow(null),
        status: Joi.string().allow('').allow(null),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getById = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId),
    }),
};

const update = {
    params: Joi.object().keys({
        id: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            sport_id: Joi.string().required(),
            name: Joi.string().required(),
            sort_order: Joi.allow('').allow(null),
            is_status: Joi.allow('').allow(null),
            is_delete: Joi.allow('').allow(null),
            id: Joi.string(),
        })
        .min(1),
};

const deleteById = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId),
    }),
};

module.exports = {
    create,
    getList,
    getById,
    update,
    deleteById,
};
