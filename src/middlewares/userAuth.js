const config = require('../config/config');
const jwt = require('jsonwebtoken');
const CONSTANT = require('../config/constant');
const { UserModel, Token } = require('../models');

const userAuth = () => async (req, res, next) => {
    var bearerToken;
    var bearerHeader = req.headers['authorization'] || req.query['api_key'];

    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(' ');
        bearerToken = bearer[1];
        req.token = bearerToken;
        const tokenExistOrNot = await Token.findOne({ token: bearerToken });
        if (!tokenExistOrNot) {
            bearerToken = '';
        }
        console.log("bearerToken", bearerToken);
        jwt.verify(bearerToken, config.jwt.secret, function (err, decoded) {
            (async () => {
                // console.log('decoded.sub==', decoded.sub)
                if (decoded) {
                    var details = await UserModel.findOne({ _id: decoded.sub }).lean();
                    // console.log('details====', details)
                    if (details) {
                        if (details.status == 0) {
                            return res.send({ code: CONSTANT.UNAUTHORIZED, message: CONSTANT.ACCOUNT_DEACTIVATE });
                        }
                        if (details.isDelete == 0) {
                            return res.send({ code: CONSTANT.UNAUTHORIZED, message: CONSTANT.ACCOUNT_DELETE });
                        }
                        details['userType'] = 'User';
                        req.user = details;
                    } else {
                        return res.send({ code: CONSTANT.UNAUTHORIZED, message: 'Session is expired, please login again!' });
                    }
                } else if (err) {
                    return res.send({ code: CONSTANT.UNAUTHORIZED, message: 'Session is expired, please login again!' });
                } else {
                    return res.send({ code: CONSTANT.UNAUTHORIZED, message: 'Session is expired, please login again!' });
                }
                next();
            })();
        });
    } else {
        return res.send({ code: CONSTANT.UNAUTHORIZED, message: CONSTANT.NO_TOKEN });
    }
};

module.exports = userAuth;
