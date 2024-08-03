const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const basicAuth = require('../../../middlewares/basicAuth');
const { adminAuthController } = require('../../../controllers')
const adminAuth = require('../../../middlewares/adminAuth');

const router = express.Router();

router.post('/auth/login', basicAuth(), validate(authValidation.login), adminAuthController.login);
router.post('/auth/logout', basicAuth(), validate(authValidation.logout), adminAuthController.logout);
router.post('/auth/refresh-tokens', basicAuth(), validate(authValidation.refreshTokens), adminAuthController.refreshTokens);
router.post('/auth/forgot-password', basicAuth(), validate(authValidation.forgotPassword), adminAuthController.forgotPassword);
router.post('/auth/reset-password', basicAuth(), validate(authValidation.resetPassword), adminAuthController.resetPassword);
router.route('/change-password').post(adminAuth('changePassword'), adminAuthController.changePassword);

router
    .route('/:adminId')
    .get(adminAuth('getProfile'), adminAuthController.getLoggedIndUserDetails)
    .patch(adminAuth('updateProfile'), adminAuthController.updateProfile);

module.exports = router;