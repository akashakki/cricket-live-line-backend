const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createStaff = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string(),
        role: Joi.string().allow('').allow(null),
        status: Joi.number().required(),
        isDelete: Joi.number().allow('').allow(null),
    }),
};

const getStaffs = {
    query: Joi.object().keys({
        name: Joi.string(),
        role: Joi.string(),
        sortBy: Joi.string(),
        searchBy: Joi.string().allow('').allow(null),
        status: Joi.string().allow('').allow(null),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getStaff = {
    params: Joi.object().keys({
        staffId: Joi.string().custom(objectId),
    }),
};

const updateStaff = {
    params: Joi.object().keys({
        staffId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().allow('').allow(null),
            address: Joi.string().allow('').allow(null),
            // country: Joi.string().allow('').allow(null),
            city: Joi.string().allow('').allow(null),
            state: Joi.string().allow('').allow(null),
            zipcode: Joi.string().allow('').allow(null),
            profilePhoto: Joi.string().allow('').allow(null),
            role: Joi.string().allow('').allow(null),
            status: Joi.number().required(),
            isDelete: Joi.number().allow('').allow(null),
            createdAt: Joi.date(),
            updatedAt: Joi.date(),
            id: Joi.string()
        })
        .min(1),
};

const deleteStaff = {
    params: Joi.object().keys({
        staffId: Joi.string().custom(objectId),
    }),
};

const register = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        //   password: Joi.string().required().custom(password),
        //   name: Joi.string().required(),
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

const logout = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

const refreshTokens = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

const forgotPassword = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
    }),
};

const resetPassword = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),
    body: Joi.object().keys({
        password: Joi.string().required(),
        // password: Joi.string().required().custom(password),
    }),
};

module.exports = {
    createStaff,
    getStaffs,
    getStaff,
    updateStaff,
    deleteStaff,
    register,
    login,
    refreshTokens,
    forgotPassword,
    resetPassword,
    logout
};