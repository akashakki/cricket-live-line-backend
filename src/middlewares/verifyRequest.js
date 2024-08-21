// const config = require('../config/config');
// const jwt = require('jsonwebtoken');
const CONSTANT = require('../config/constant');
const { UserModel } = require('../models');

const VerifyRequest = (method, apiType) => async (req, res, next) => {
    let apiKey = req.headers['key'] || req.query['key'];
    let apiKeySecret = req.headers['secret'] || req.query['secret'];
    console.log('apiType====', apiType)
    console.log(apiKeySecret)
    if (typeof apiKey !== 'undefined' && typeof apiKeySecret !== 'undefined') {
        (async () => {
            var details = await UserModel.findOne({ apiKeySecret: apiKeySecret, apiKey: apiKey });
            if (details == null) {
                return res.send({ code: CONSTANT.UNAUTHORIZED, message: CONSTANT.INVALID_MSG });
            } else {
                req.user = details;
            }
            next();
        })();
    } else {
        return res.send({ code: CONSTANT.UNAUTHORIZED, message: CONSTANT.INVALID_MSG });
    }
};

module.exports = VerifyRequest;
