const config = require('../config/config');
const jwt = require('jsonwebtoken');
const CONSTANT = require('../config/constant');
const {AdminModel} = require('../models');

const adminAuth = () => async (req, res, next) => {
    var bearerToken;
    var bearerHeader = req.headers["authorization"] || req.query["api_key"];
    // console.log("bearerHeader",bearerHeader);
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        // console.log("bearerToken", bearerToken);
        jwt.verify(bearerToken, config.jwt.secret, function (err, decoded) {
            (async () => {
                if (decoded && decoded.sub) {
                    var details = await AdminModel.findOne({_id: decoded.sub});
                    if (details) {
                        if (details && details.status == 0) {
                            return res.send({code: CONSTANT.UNAUTHORIZED, message: CONSTANT.ACCOUNT_DEACTIVATE});
                        }
                        if (details && details.isDelete == 0) {
                            return res.send({code: CONSTANT.UNAUTHORIZED, message: CONSTANT.ACCOUNT_DELETE});
                        }
                        req.user = details;
                    } else {
                        // return res.send({
                        //     code: CONSTANT.UNAUTHORIZED,
                        //     message: 'Session is expired, please login again!'
                        // });
                        // req.user = null;
                        return next();
                    }
                } else if (err) {
                    return res.send({code: CONSTANT.UNAUTHORIZED, message: 'Session is expired, please login again!'});
                } else {
                    return res.send({code: CONSTANT.UNAUTHORIZED, message: 'Session is expired, please login again!'});
                }
                next();
            })();
        });
    } else {
        return res.send({code: CONSTANT.UNAUTHORIZED, message: CONSTANT.NO_TOKEN});
    }
};

module.exports = adminAuth;