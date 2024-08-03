const catchAsync = require('../utils/catchAsync');
const { UserService, tokenService } = require('../services');
const CONSTANT = require('../config/constant');
const config = require('../config/config');
const { MailFunction } = require('../helpers');
const axios = require('axios');
const linkedInCredentials = config.linkedInCredentials;

const createUser = catchAsync(async (req, res) => {
    req.body.userType = "user";
    const user = await UserService.createUser(req.body);
    res.send(user);
});

const getUser = catchAsync(async (req, res) => {
    const user = await UserService.getUserById(req.params.userId);
    if (!user) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.USER_NOT_FOUND });
    }
    res.send({ data: user, code: CONSTANT.SUCCESSFUL, message: CONSTANT.USER_DETAILS });
});

const updateUser = catchAsync(async (req, res) => {
    const user = await UserService.updateUserById(req.params.userId, req.body);
    res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
    var details = await UserService.deleteUserById(req.params.userId);
    if (details) {
        res.send(details);
    }
    res.send(details);
});

const login = catchAsync(async (req, res) => {
    var { email, password } = req.body;
    email = email.toLocaleLowerCase()
    const user = await UserService.loginUserWithEmailAndPassword(email, password);
    if (user && user.data && user.code == 200) {
        const tokens = await tokenService.generateAuthTokens(user.data);
        if (user && tokens) {
            res.send({ data: { user: user.data, tokens }, code: CONSTANT.SUCCESSFUL, message: CONSTANT.USER_DETAILS });
        } else {
            res.send(user)
        }
    } else {
        res.send(user)
    }
});

const logout = catchAsync(async (req, res) => {
    await UserService.logout(req.body.refreshToken);
    res.send({ data: {}, code: CONSTANT.SUCCESSFUL, message: CONSTANT.Logout_MSG })
});

const refreshTokens = catchAsync(async (req, res) => {
    const tokens = await UserService.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
    const user = await UserService.getUserByEmail(req.body.email);
    if (user) {
        var resetPasswordToken = await tokenService.generateResetPasswordToken(user);
        await MailFunction.sendResetPasswordEmail(req.body.email, resetPasswordToken, 'user');
        res.send({ data: {}, code: CONSTANT.SUCCESSFUL, message: CONSTANT.FORGOT_PASSWORD });
    } else {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.USER_NOT_FOUND });
    }
});

const resetPassword = catchAsync(async (req, res) => {
    var response = await UserService.resetPassword(req.query.token, req.body.password);
    res.send(response);
});

const verifyEmail = catchAsync(async (req, res) => {
    var response = await UserService.verifyUserEmail(req.query.token);
    res.send(response);
});

const resendEmailVerification = catchAsync(async (req, res) => {
    const response = await UserService.resendUserEmailVerification(req.query.token, req.query.email);
    res.send(response);
});

const getLinkedInToken = catchAsync(async (req, res) => {
    const { code } = req.query;
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: linkedInCredentials.redirectUrl,
        client_id: linkedInCredentials.clientId,
        client_secret: linkedInCredentials.clientSecret
    });

    try {
        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params);
        const accessToken = tokenResponse.data.access_token;
        const profile = await getUserProfile(accessToken);
        console.log("🚀 ~ file: user.controller.js:105 ~ getLinkedInToken ~ profile:", profile)

        const checkRecords = await UserService.getUserByEmail(profile?.email);
        if (checkRecords) {
            const tokens = await tokenService.generateAuthTokens(checkRecords);
            if (checkRecords && tokens) {
                res.send({ data: { user: checkRecords, tokens }, code: CONSTANT.SUCCESSFUL, message: CONSTANT.USER_DETAILS });
            }
        } else {
            profile['emailVerificationStatus'] = profile?.email_verified;
            profile['profilePicture'] = profile?.picture;
            profile['loginWith'] = 'LinkedIn';
            const user = await UserService.createUserWithSocial(profile);
            res.send(user);
        }
    } catch (error) {
        res.send({
            data: {},
            code: (error.response?.status || 500),
            message: (error.response?.data || 'An error occurred')
        });
    }
});

const getLinkedInURL = catchAsync(async (req, res) => {
    try {
        const state = Math.random().toString(36).substring(7);
        const SCOPE = 'profile email openid'
        const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedInCredentials.clientId}&redirect_uri=${encodeURIComponent(linkedInCredentials.redirectUrl)}&scope=${SCOPE}&state=${state}`;
        res.send({ data: { url: linkedInAuthUrl, state }, code: CONSTANT.SUCCESSFUL, message: "Token" });
    } catch (error) {
        console.error("Error in resendUserEmailVerification:", error.response ? error.response.data : error.message);
        return { data: {}, code: CONSTANT.SERVER_ERROR, message: CONSTANT.SERVER_ERROR_MESSAGE };
    }
});

const getUserProfile = async (accessToken) => {
    try {
        const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching LinkedIn profile:", error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch LinkedIn profile');
    }
};

module.exports = {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    login,
    logout,
    refreshTokens,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendEmailVerification,
    getLinkedInToken,
    getLinkedInURL
};