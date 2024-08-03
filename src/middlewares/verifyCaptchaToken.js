const CONSTANT = require('../config/constant');
const fetch = require('node-fetch');

const reCaptchaTokenVerify = () => async (req, res, next) => {
    const { _recaptcha_token } = req.query;
    const secretKey = '6LcSE_kpAAAAAG4MbBAxV9RGiSsMo8VQCaucYqMD';

    try {
        const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `secret=${secretKey}&response=${_recaptcha_token}`
        });
        const data = await response.json();

        if (data.success) {
            // res.status(200).send({ success: true });
            console.log('=======Verified========')
        } else {
            //   res.status(400).send({ success: false, error: data['error-codes'] });
            return res.send({ code: CONSTANT.UNAUTHORIZED, message: CONSTANT.INVALID_REQUEST });
        }
        next();
    } catch (error) {
        // res.status(500).send({ success: false, error: error.message });
        return res.send({ code: CONSTANT.UNAUTHORIZED, message: CONSTANT.INVALID_REQUEST });
    }
};

module.exports = reCaptchaTokenVerify;
