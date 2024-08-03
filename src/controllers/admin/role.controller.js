const pick = require('../../utils/pick');
const catchAsync = require('../../utils/catchAsync');
const { adminRoleService } = require('../../services');
const CONSTANT = require('../../config/constant');

const createRole = catchAsync(async (req, res) => {
    const role = await adminRoleService.createRole(req.body);
    res.send(role);
});

const getRoles = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy']);
    const result = await adminRoleService.queryRoles(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.ROLE_LIST });
});

const getRole = catchAsync(async (req, res) => {
    const role = await adminRoleService.getRoleById(req.params.roleId);
    if (!role) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.ROLE_NOT_FOUND });
    }
    res.send({ data: role, code: CONSTANT.SUCCESSFUL, message: CONSTANT.ROLE_DETAILS });
});

const updateRole = catchAsync(async (req, res) => {
    const role = await adminRoleService.updateRoleById(req.params.roleId, req.body);
    res.send(role);
});

const deleteRole = catchAsync(async (req, res) => {
    var details = await adminRoleService.deleteRoleById(req.params.roleId);
    if (details) {
        res.send(details);
    } else {
        res.send(details);
    }
});

const getRolesWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['searchBy']);
    const result = await adminRoleService.queryRolesWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.ROLE_LIST });
});

module.exports = {
    createRole,
    getRoles,
    getRole,
    updateRole,
    deleteRole,
    getRolesWithoutPagination
};
