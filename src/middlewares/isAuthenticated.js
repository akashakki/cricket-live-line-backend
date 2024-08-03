const jwt = require("jsonwebtoken");
const CONSTANT = require('../config/constant');
const config = require('../config/config');
const { CompanyModel, AdminModel } = require("../models");



exports.isAuthenticated = (req, res, next) => {
    var bearerToken;
//   console.log("here i am");
  var bearerHeader = req.headers["authorization"] || req.query["api_key"];

  // Check for bearer token
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    req.token = bearerToken;
    console.log("bearerToken", bearerToken);

    // Verify JWT token
    jwt.verify(bearerToken, config.jwt.secret, async function (err, decoded) {
      if (err) {
        console.log('Token error', err);
        return res.send({ code: CONSTANT.UNAUTHORIZED, message: 'Invalid Token!' });
      }

      // Try finding company first
      try {
        var details = await CompanyModel.findOne({ _id: decoded.sub });
        if (details) {
          req.user = details;
          return next();
        }
      } catch (error) {
        console.log('Error finding company:', error);
      }

      // If company not found, check for admin user
      try {
        const adminDetails = await AdminModel.findOne({ _id: decoded.sub });
        if (adminDetails) {
          req.user = adminDetails; // Set req.user to admin details
          return next();
        }
      } catch (error) {
        console.log('Error finding admin:', error);
      }

      // If neither company nor admin found, proceed to next middleware (optional)
      return next(); // Or handle unauthorized access for non-company and non-admin users
    });
  } else {
    return res.send({ code: CONSTANT.UNAUTHORIZED, message: CONSTANT.NO_TOKEN });
  }
}
