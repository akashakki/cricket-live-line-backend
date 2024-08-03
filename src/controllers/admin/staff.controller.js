const pick = require('../../utils/pick');
const catchAsync = require('../../utils/catchAsync');
const { adminStaffService, adminAuthService, s3Service } = require('../../services');
const MailFunction = require('../../helpers/mailFunctions');
const CONSTANT = require('../../config/constant');

const createAdminStaffUser = catchAsync(async (req, res) => {
    const staff = await adminStaffService.createAdminStaffUser(req.body);
    // if (staff) {
    //     MailFunction.sendNewPasswordEmail(req.body.email, req.body.password, req.body.name)
    // }
    res.send(staff);
});

const getAdminStaffUsers = catchAsync(async (req, res) => {
    var options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    options['loginedInUser'] = req.user._id
    const result = await adminStaffService.queryAdminStaffUsers(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.COMPANY_USER_LIST });
});

const getAdminStaffUser = catchAsync(async (req, res) => {
    const staff = await adminStaffService.getAdminStaffUserById(req.params.staffId);
    if (!staff) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.COMPANY_USER_NOT_FOUND });
    }
    res.send({ data: staff, code: CONSTANT.SUCCESSFUL, message: CONSTANT.COMPANY_USER_DETAILS });
});

const updateAdminStaffUser = catchAsync(async (req, res) => {
    const staff = await adminStaffService.updateAdminStaffUserById(req.params.staffId, req.body);
    res.send(staff);
});

const deleteAdminStaffUser = catchAsync(async (req, res) => {
    var details = await adminStaffService.deleteAdminStaffUserById(req.params.staffId);
    if (details) {
        res.send(details);
    } else {
        res.send(details);
    }
});
const getAdminStaffUsersWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['searchBy', 'companyId']);
    const result = await adminStaffService.queryUsersWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.CLIENT_LIST });
});

const updateProfile = catchAsync(async (req, res) => {
    var result;
    if (req.files && req.files.profilePhoto && req.files.profilePhoto[0]) {
        profilePhoto = await s3Service.uploadImage(req.files.profilePhoto[0]);
        if (profilePhoto) {
            req.body.profilePhoto = (profilePhoto.data && profilePhoto.data.Key) ? profilePhoto.data.Key : ''
        }
    }
    console.log('req.user---', req.user)
    if (req.user && req.user.type == 'superadmin') {
        result = await adminAuthService.updateAdminById(req.user._id, req.body);
    } else {
        result = await adminStaffService.updateAdminStaffUserById(req.user._id, req.body);
    }
    res.send(result);
});


const changePassword = catchAsync(async (req, res) => {
    var result;
    if (req.user && req.user.company) {
        var userDetails = await adminStaffService.getAdminStaffUserById(req.user._id);
        if (!userDetails || !(await userDetails.isPasswordMatch(req.body.oldPassword))) {
            res.send({ data: {}, code: CONSTANT.UNAUTHORIZED, message: CONSTANT.OLD_PASSWORD_MSG })
        } else {
            result = await adminStaffService.updateAdminStaffUserById(req.user._id, req.body);
        }
    } else {
        var companyDetails = await adminAuthService.getCompanyById(req.user._id);
        if (!companyDetails || !(await companyDetails.isPasswordMatch(req.body.oldPassword))) {
            res.send({ data: {}, code: CONSTANT.UNAUTHORIZED, message: CONSTANT.OLD_PASSWORD_MSG })
        } else {
            result = await adminAuthService.updateCompanyById(req.user._id, req.body);
        }
    }
    if (result) {
        res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.CHANGE_PASSWORD });
    }
});
module.exports = {
    createAdminStaffUser,
    getAdminStaffUsers,
    getAdminStaffUser,
    updateAdminStaffUser,
    deleteAdminStaffUser,
    getAdminStaffUsersWithoutPagination,
    updateProfile,
    changePassword
};