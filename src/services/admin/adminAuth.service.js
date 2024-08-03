// const httpStatus = require('http-status');
const { AdminModel } = require('../../models');
const CONSTANT = require('../../config/constant');
const Token = require('../../models/token.model');
const { tokenTypes } = require('../../config/tokens');
const tokenService = require('../token.service');
const s3Service = require('../s3.service');

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getAdminById = async (id) => {
    return AdminModel.findById(id);
};

/**
 * Update company by id
 * @param {ObjectId} adminId
 * @param {Object} updateBody
 * @returns {Promise<Company>}
 */

const updateAdminById = async (adminId, updateBody, files) => {
    const admin = await getAdminById(adminId);
    if (!admin) {
      return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.COMPANY_USER_NOT_FOUND };
    }
    if (updateBody.email && (await AdminModel.isEmailTaken(updateBody.email, adminId))) {
      return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.ADMIN_STAFF_EMAIL_ALREADY_EXISTS };
    }
    if (updateBody.phone && (await AdminModel.isMobileTaken(updateBody.phone, adminId))) {
      return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.ADMIN_STAFF_MOBILE_ALREADY_EXISTS };
    }
    var uploadResult;
    if (files && files.length != 0) {
      uploadResult = await s3Service.uploadDocuments(files, 'admin-profile-photo', '');
    }
    if (uploadResult && uploadResult.length != 0) {
      updateBody.profilePhoto = uploadResult[0].key;
    }
    Object.assign(admin, updateBody);
    await admin.save();
    // console.log('update-role-' + adminId, '>>>>>>>>>>>>>>socketEvent');
    // io.emit('update-role-' + adminId, { status: true });
    return { data: admin, code: CONSTANT.SUCCESSFUL, message: CONSTANT.ADMIN_STAFF_UPDATE };
  };

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getAdminByEmail = async (email) => {
    return AdminModel.findOne({ email });
};

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
    var details;
    details = await getAdminByEmail(email);
    if (!details || !(await details.isPasswordMatch(password))) {
        return { data: {}, code: CONSTANT.UNAUTHORIZED, message: CONSTANT.UNAUTHORIZED_MSG }
    }
    return { data: details, code: CONSTANT.SUCCESSFUL, message: CONSTANT.UNAUTHORIZED_MSG };
};

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const validateUserWithEmail = async (email) => {
    var details;
    details = await getAdminByEmail(email);
    if (details == null) {
        details = await getStaffByEmail(email);
    }
    return details;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
    if (!refreshTokenDoc) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG }
    }
    await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
    try {
        const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
        const user = await getAdminById(refreshTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await refreshTokenDoc.remove();
        return tokenService.generateAuthTokens(user);
    } catch (error) {
        return { data: {}, code: CONSTANT.UNAUTHORIZED, message: CONSTANT.UNAUTHORIZED_MSG }
    }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
    try {
      // Attempt to verify the token
      const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
      // Rest of the function logic (unchanged)
      var admin = await AdminModel.findOne({ _id: resetPasswordTokenDoc.user });
      await updateAdminById(admin._id, { password: newPassword });
      await Token.deleteMany({ user: admin._id, type: tokenTypes.RESET_PASSWORD });
      return { data: {}, code: CONSTANT.SUCCESSFUL, message: 'Password updated successfully' };
    } catch (error) {
    //   console.log('=====error=====', JSON.stringify(error)); // Log the original error for debugging purposes
      let errorMessage = 'Password reset failed';  // Default error message
  
      // Handle specific error types for better user feedback
      if (error.message === 'jwt expired') {
        errorMessage = 'Reset password token expired. Please request a new one.';
      }
  
      return { data: {}, code: CONSTANT.UNAUTHORIZED, message: errorMessage };
    }
  };
  

module.exports = {
    getAdminByEmail,
    getAdminById,
    updateAdminById,
    validateUserWithEmail,
    loginUserWithEmailAndPassword,
    logout,
    refreshAuth,
    resetPassword
};