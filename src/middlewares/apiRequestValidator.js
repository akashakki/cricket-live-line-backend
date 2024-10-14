const CONSTANT = require('../config/constant');
const { UserModel } = require('../models');
var auth = require('basic-auth');
const config = require('../config/config');

// Middleware function to verify API key, token, domain, server IP, and hidden values
const apiRequestValidator = (method, apiType) => async (req, res, next) => {
    try {
        // Extract necessary values from headers or query params
        const apiKey = req.headers['key'] || req.query['key'];
        const apiKeySecret = req.headers['secret'] || req.query['secret'];
        const token = req.headers['token']; // Assuming token is passed in headers
        const domain = req.headers['origin'] || req.headers['referer']; // Domain check from 'origin' or 'referer' header
        console.log("🚀 ~ file: apiRequestValidator.js:14 ~ apiRequestValidator ~ domain:", domain)
        const serverIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Server IP check (may be in 'x-forwarded-for' or remote address)
        console.log("🚀 ~ file: apiRequestValidator.js:16 ~ apiRequestValidator ~ serverIP:", serverIP);
        console.log("🚀 ~ file: apiRequestValidator.js:16 ~ apiRequestValidator ~ remoteAddress:", req.socket.remoteAddress)
        const hiddenValue = req.headers['accept']; // Custom hidden value from header
        console.log("🚀 ~ file: apiRequestValidator.js:18 ~ apiRequestValidator ~ hiddenValue:", hiddenValue)
        
        // Check if all required values are provided
        if (apiKey && apiKeySecret && token && domain && hiddenValue) {
            
            // Fetch user details from the database with API key and secret
            const userDetails = await UserModel.findOne({ apiKeySecret, apiKey });

            // If no matching user found, return unauthorized response
            if (!userDetails) {
                return res.status(401).send({ 
                    code: CONSTANT.UNAUTHORIZED, 
                    message: 'Unauthorized access' // Generic unauthorized message
                });
            }

            // Perform additional validation (e.g., token, domain, IP, hidden value)
            const isTokenValid = validateToken(token);
            const isDomainValid = validateDomain(domain, userDetails);
            // const isIPValid = validateIP(serverIP, userDetails);
            const isHiddenValueValid = validateHiddenValue(hiddenValue, userDetails);

            // If any validation fails, return generic unauthorized response
            if (!isTokenValid || !isDomainValid || !isHiddenValueValid) {
                return res.status(401).send({ 
                    code: CONSTANT.UNAUTHORIZED, 
                    message: 'Unauthorized access' // Generic unauthorized message
                });
            }

            // Attach user details to the request object for use in next middleware or route handler
            req.user = userDetails;
            next(); // Proceed to the next middleware or route handler

        } else {
            // If required values are missing, return generic unauthorized response
            return res.status(401).send({ 
                code: CONSTANT.UNAUTHORIZED, 
                message: 'Unauthorized access' // Generic unauthorized message
            });
        }
    } catch (error) {
        console.error('Error in VerifyRequest middleware:', error);
        return res.status(500).send({ 
            code: CONSTANT.SERVER_ERROR, 
            message: 'Internal Server Error' 
        });
    }
};

// Custom validation functions
const validateToken = (token) => {
    // Implement your token validation logic here
    const combination = btoa(`${config.username}:${config.password}`);
    return token?.split("Basic ")[1] === combination //'validToken'; // Example validation
};

const validateDomain = (domain, userDetails) => {
    // Implement domain validation logic (match with allowed domains)
    const allowedDomains = userDetails?.domains//['https://yourdomain.com', 'https://anotherdomain.com'];
    return allowedDomains.includes(domain);
};

const validateIP = (ip, userDetails) => {
    // Implement IP validation logic (match with allowed IP range or specific IP)
    const allowedIPs = userDetails?.ipAddress//['123.123.123.123', '234.234.234.234']; // Example IPs
    return allowedIPs.includes(ip);
};

const validateHiddenValue = (hiddenValue, userDetails) => {
    // Implement hidden value validation logic
    return hiddenValue === userDetails?.hiddenValue//'expectedHiddenValue'; // Example validation
};

module.exports = apiRequestValidator;
