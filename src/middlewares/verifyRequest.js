const config = require('../config/config');
const jwt = require('jsonwebtoken');
const CONSTANT = require('../config/constant');
const { CompanyModel } = require('../models');

const VerifyRequest = (method, apiType) => async (req, res, next) => {
    let apiKey = req.headers['key'] || req.query['key'];
    let apiKeySecret = req.headers['secret'] || req.query['secret'];
    console.log('apiType====', apiType)
    console.log(apiKeySecret)
    if (typeof apiKey !== 'undefined' && typeof apiKeySecret !== 'undefined') {
        (async () => {
            var details = await CompanyModel.findOne({ apiKeySecret: apiKeySecret, apiKey: apiKey });
            let apiHitLimit = 0;
            if (details) {
                for (let i = 0; i < details.apiDetails.length; i++) {
                    if (details.apiDetails[i].type == apiType) {
                        apiHitLimit = details.apiDetails[i].apiHitLimit;
                        break;
                    }
                }
            }
            if (details == null) {
                return res.send({ code: CONSTANT.UNAUTHORIZED, message: CONSTANT.INVALID_MSG });
            } else if (apiHitLimit <= 0) {
                return res.send({ code: CONSTANT.LIMIT_EXCEEDED, message: CONSTANT.LIMIT_EXCEEDED_MSG });
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
