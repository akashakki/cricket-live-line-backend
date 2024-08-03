const CONSTANT = require('../config/constant');
const { DisposableEmailModel } = require('../models');

const validateEmail = () => async (req, res, next) => {
    const { email } = req.body;
    
    // Extract domain from email
    const domain = email.split('@')[1];

    try {
        // Check if domain exists in DisposableEmailModel
        const domainExists = await DisposableEmailModel.exists({ domain });

        // Check if email exists in DisposableEmailModel
        const emailExists = await DisposableEmailModel.exists({ email });

        // If domain or email exists, return error
        if (domainExists || emailExists) {
            return res.send({ code: CONSTANT.UNAUTHORIZED, message: 'The email address or domain you entered is not allowed.' });
        }

        // If domain and email are not found, proceed to next middleware
        next();
    } catch (error) {
        console.error('Error validating email:', error);
        return res.send({ code: CONSTANT.UNAUTHORIZED, message: CONSTANT.INVALID_REQUEST });
    }
};

module.exports = validateEmail;
