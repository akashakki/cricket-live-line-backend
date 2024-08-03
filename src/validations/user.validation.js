const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createUser = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        companyName: Joi.string().allow('').allow(null),
        email: Joi.string().required(),
        phone: Joi.string().allow('').allow(null),
        alternatePhone: Joi.string().allow('').allow(null),
        password: Joi.string(),
        isStatus: Joi.number().allow('').allow(null),
        isDelete: Joi.number().allow('').allow(null),
    }),
};

const getUsers = {
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

const getUser = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId),
    }),
};

const updateUser = {
    params: Joi.object().keys({
        userId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().required(),
            companyName: Joi.string().allow('').allow(null),
            diallingCode: Joi.string().allow('').allow(null),
            email: Joi.string().required(),
            phone: Joi.string().allow('').allow(null),
            alternatePhone: Joi.string().allow('').allow(null),
            status: Joi.number().allow('').allow(null),
            isStatus: Joi.number().allow('').allow(null),
            isDelete: Joi.number().allow('').allow(null),
            createdAt: Joi.date(),
            updatedAt: Joi.date(),
            id: Joi.string()
        })
        .min(1),
};

const deleteUser = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId),
    }),
};

const register = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        companyName: Joi.string().allow('').allow(null),
        email: Joi.string().required(),
        password: Joi.string().required(),
        diallingCode: Joi.string().allow('').allow(null),
        phone: Joi.string().required(),
        userType: Joi.string().required(),
        isAcceptedTermsCondition: Joi.boolean().required(),
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
const verifyEmail = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),

};

module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    register,
    login,
    refreshTokens,
    forgotPassword,
    resetPassword,
    logout,
    verifyEmail
};