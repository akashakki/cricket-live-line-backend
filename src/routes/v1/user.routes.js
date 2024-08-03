const express = require('express');
// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });
const {basicAuth, reCaptchaTokenVerify, validateEmail} = require('../../middlewares');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { userController } = require('../../controllers')

const router = express.Router();

router.post('/auth/register', validateEmail(), reCaptchaTokenVerify(), validate(userValidation.register), userController.createUser);
router.post('/auth/login', reCaptchaTokenVerify(), validate(userValidation.login), userController.login);
router.post('/auth/logout', basicAuth(), validate(userValidation.logout), userController.logout);
router.post('/auth/refresh-tokens', basicAuth(), validate(userValidation.refreshTokens), userController.refreshTokens);
router.post('/auth/forgot-password', basicAuth(), validate(userValidation.forgotPassword), userController.forgotPassword);
router.post('/auth/reset-password', basicAuth(), validate(userValidation.resetPassword), userController.resetPassword);
router.get('/auth/verify', basicAuth(), validate(userValidation.verifyEmail), userController.verifyEmail);
router.get('/auth/resend-email-verification', basicAuth(), userController.resendEmailVerification);
router.get('/auth/getLinkedInToken', userController.getLinkedInToken);
router.get('/auth/getLinkedAuth', userController.getLinkedInURL);

module.exports = router;