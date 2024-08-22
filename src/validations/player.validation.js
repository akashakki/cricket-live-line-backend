const Joi = require('joi');
const { objectId } = require('./custom.validation');

const create = {
    body: Joi.object().keys({
        series_id: Joi.string().required(),
        series: Joi.string().required(),
        series_type: Joi.string().allow('').allow(null),
        series_date: Joi.string().allow('').allow(null),
        total_matches: Joi.string().allow('').allow(null),
        start_date: Joi.string().allow('').allow(null),
        end_date: Joi.string().allow('').allow(null),
        image: Joi.string().allow('').allow(null),
        month_wise: Joi.string().allow('').allow(null),
    }),
};
const getList = {
    query: Joi.object().keys({
        sortBy: Joi.string(),
        searchBy: Joi.string().allow('').allow(null),
        series_id: Joi.string().allow('').allow(null),
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
            series_id: Joi.string().required(),
            series: Joi.string().required(),
            series_type: Joi.string().allow('').allow(null),
            series_date: Joi.string().allow('').allow(null),
            total_matches: Joi.string().allow('').allow(null),
            start_date: Joi.string().allow('').allow(null),
            end_date: Joi.string().allow('').allow(null),
            image: Joi.string().allow('').allow(null),
            month_wise: Joi.string().allow('').allow(null),
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
