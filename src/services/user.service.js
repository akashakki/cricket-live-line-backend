const { UserModel, CompanyModel } = require("../models");
const CONSTANT = require("../config/constant");
const Token = require("../models/token.model");
const { tokenTypes } = require("../config/tokens");
const tokenService = require("./token.service");
// const {emailVerificationToken}=require('../helpers/emailVerificationToken.js');
const bcrypt = require("bcryptjs");
const mailFunctions = require("../helpers/mailFunctions");

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
    return UserModel.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    return UserModel.findOne({ email, isStatus: 1, isDelete: 1 });
};

/**
 * Create a User
 * @param {Object} requestBody
 * @returns {Promise<user>}
 */
const createUser = async (requestBody) => {
    if (await UserModel.isEmailTaken(requestBody.email)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.USER_EMAIL_ALREADY_EXISTS };
    }
    if (requestBody.phone && (await UserModel.isPhoneTaken(requestBody.phone))) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.USER_NAME_ALREADY_EXISTS };
    }
    // saving user email verification token in database
    const user = await UserModel.create(requestBody);
    const token = await tokenService.generateEmailVerificationToken(user);
    await mailFunctions.sendVerificationEmail(user, token);
    if (requestBody?.companyName && requestBody?.userType == 'company') {
        await CompanyModel.create({ companyName: requestBody?.companyName, companyId: user._id })
    }
    return { data: user, code: 200, message: CONSTANT.USER_CREATE };
};

const createUserWithSocial = async (requestBody) => {
    if (await UserModel.isEmailTaken(requestBody.email)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.USER_EMAIL_ALREADY_EXISTS };
    }
    if (requestBody.phone && (await UserModel.isPhoneTaken(requestBody.phone))) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.USER_NAME_ALREADY_EXISTS };
    }
    // saving user email verification token in database
    const user = await UserModel.create(requestBody);
    const token = await tokenService.generateEmailVerificationToken(user);
    if (requestBody?.companyName && requestBody?.userType == 'company') {
        await CompanyModel.create({ companyName: requestBody?.companyName, companyId: user._id })
    }
    return { data: user, code: 200, message: CONSTANT.USER_CREATE };
};

/**
 * Query for user
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.searchBy] - Search By use for search
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (options) => {
    var condition = {};
    if (options.searchBy && options.searchBy != "undefined") {
        condition["name"] = {
            $regex: ".*" + options.searchBy + ".*",
            $options: "si",
        };
    }
    options["sort"] = { createdAt: -1 };
    const users = await UserModel.paginate(condition, options);
    return users;
};

/**
 * Update company by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Company>}
 */
const updateUserById = async (userId, updateBody) => {
    const user = await getUserById(userId);
    if (!user) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.USER_NOT_FOUND, };
    }
    if (updateBody.email && (await UserModel.isEmailTaken(updateBody.name, userId))) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.USER_EMAIL_ALREADY_EXISTS, };
    }
    updateBody.updatedAt = new Date();
    Object.assign(user, updateBody);
    await user.save();
    return { data: user, code: CONSTANT.SUCCESSFUL, message: CONSTANT.USER_UPDATE, };
};

/**
 * Delete User by id
 * @param {ObjectId} userId
 * @returns {Promise<user>}
 */
const deleteUserById = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.USER_NOT_FOUND, };
    }

    user.isDelete = 0;
    await user.save();
    var message = user.status == 1 ? CONSTANT.USER_STATUS_ACTIVE : CONSTANT.USER_STATUS_INACTIVE;
    return { data: user, code: CONSTANT.SUCCESSFUL, message: message };
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
    const refreshTokenDoc = await Token.findOne({
        token: refreshToken,
        type: tokenTypes.REFRESH,
        blacklisted: false,
    });

    if (!refreshTokenDoc) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG, };
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

        const user = await getUserById(refreshTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await refreshTokenDoc.remove();
        return tokenService.generateAuthTokens(user);
    } catch (error) {
        return { data: {}, code: CONSTANT.UNAUTHORIZED, message: CONSTANT.UNAUTHORIZED_MSG, };
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
        const resetPasswordTokenDoc = await tokenService.verifyToken(
            resetPasswordToken,
            tokenTypes.RESET_PASSWORD
        );
        var company = await UserModel.findOne({
            _id: resetPasswordTokenDoc.user,
        });
        await updateUserById(company._id, { password: newPassword });
        await Token.deleteMany({ user: company._id, type: tokenTypes.RESET_PASSWORD, });

        return { data: {}, code: CONSTANT.SUCCESSFUL, message: "Password updated successfully", };
    } catch (error) {
        return { data: {}, code: CONSTANT.UNAUTHORIZED, message: "Password reset failed", };
    }
};

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
    var details = await getUserByEmail(email);
    if (!details || !(await details.isPasswordMatch(password))) {
        return { data: {}, code: CONSTANT.UNAUTHORIZED, message: CONSTANT.UNAUTHORIZED_MSG, };
    }

    // Check if user email is verified
    if (!details.emailVerificationStatus) {
        // Sending verification email reminder
        return { data: { email: email }, code: CONSTANT.BAD_REQUEST, message: CONSTANT.VERIFICATION_REQUIRED_MSG, };
    }
    return { data: details, code: CONSTANT.SUCCESSFUL, message: CONSTANT.UNAUTHORIZED_MSG, };
};

// verification of user email

const verifyUserEmail = async (verifyToken) => {
    try {
        const verificationTokenDoc = await tokenService.verifyToken(
            verifyToken,
            tokenTypes.EMAIL_VERIFICATION
        );
        console.log("verificationTokenDoc", verificationTokenDoc);
        const user = await getUserById(verificationTokenDoc?.user);
        if (user.emailVerificationStatus == true) {
            return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.USER_ALREADY_VERIFIED };
        }
        await tokenService.deleteToken(verifyToken, tokenTypes.EMAIL_VERIFICATION);
        await updateUserById(user._id, { emailVerificationStatus: true });
        return { data: {}, code: CONSTANT.SUCCESSFUL, message: CONSTANT.USER_EMAIL_VERIFY_MSG };

    } catch (error) {
        // console.log("error", error);
        let errorMessage = CONSTANT.USER_EMAIL_VERIFY_FAIL;  // Default error message

        // Handle specific error types for better user feedback
        if (error.message === 'jwt expired') {
            errorMessage = 'Your email verification link has expired. Please click the button below to resend the verification link';
        }
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.USER_EMAIL_VERIFY_FAIL };
    }
};

//again vefication of user email if user email is not verified
const resendUserEmailVerification = async (token, email) => {
    try {
        let user = {};
        if (token && token != 'undefined') {
            const tokenDoc = await Token.findOne({ token });
            user = await getUserById(tokenDoc?.user);
        } else {
            user = await getUserByEmail(email);
        }

        console.log("user", user);

        if (user) {
            if (user.emailVerificationStatus === true) {
                return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.USER_ALREADY_VERIFIED };
            } else {
                const tokenRes = await tokenService.generateEmailVerificationToken(user);
                await mailFunctions.sendVerificationEmail(user, tokenRes);
                return { data: {}, code: 200, message: CONSTANT.USER_RESEND_VERIFICATION_LINK };
            }
        } else {
            return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.USER_NOT_FOUND };
        }
    } catch (error) {
        console.error("Error in resendUserEmailVerification:", error);
        return { data: {}, code: CONSTANT.SERVER_ERROR, message: CONSTANT.SERVER_ERROR_MESSAGE };
    }
};

module.exports = {
    createUser,
    createUserWithSocial,
    queryUsers,
    updateUserById,
    deleteUserById,
    getUserById,
    getUserByEmail,
    loginUserWithEmailAndPassword,
    logout,
    refreshAuth,
    resetPassword,
    verifyUserEmail,
    resendUserEmailVerification,
};
