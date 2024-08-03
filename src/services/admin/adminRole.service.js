const { AdminRoles } = require('../../models');
const CONSTANT = require('../../config/constant');
/**
 * Create a role
 * @param {Object} roleBody
 * @returns {Promise<Roles>}
 */
const createRole = async (roleBody) => {
    if (await AdminRoles.isNameTaken(roleBody.name, '', roleBody.company)) {
        // return new ApiError(httpStatus.BAD_REQUEST, CONSTANT.ROLE_NAME_ALREADY_EXISTS);
        return { data: {}, code: 400, message: CONSTANT.ROLE_NAME_ALREADY_EXISTS }
    } else {
        const role = await AdminRoles.create(roleBody);
        return { data: role, code: 200, message: CONSTANT.ROLE_CREATE };
    }
};

/**
 * Query for roles
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.searchBy] - Search By use for search
 * @returns {Promise<QueryResult>}
 */
const queryRoles = async (options) => {
    var condition = { $and: [{ company: options.companyId, isDelete: 1 }] };
    if (options.searchBy && options.searchBy != 'undefined') {
        condition.$and.push({
            $or: [{
                name: {
                    $regex: ".*" + options.searchBy + ".*",
                    $options: "si"
                }
            }]
        })
    }
    options['sort'] = { createdAt: -1 }
    const roles = await AdminRoles.paginate(condition, options);
    return roles;
};

/**
 * Get role by id
 * @param {ObjectId} id
 * @returns {Promise<Roles>}
 */
const getRoleById = async (id) => {
    return AdminRoles.findById(id);
};

/**
 * Update role by id
 * @param {ObjectId} roleId
 * @param {Object} updateBody
 * @returns {Promise<Roles>}
 */
const updateRoleById = async (roleId, updateBody) => {
    const role = await getRoleById(roleId);
    if (!role) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.ROLE_NOT_FOUND }
    }
    if (updateBody.email && (await AdminRoles.isNameTaken(updateBody.name, roleId, updateBody.company))) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.ROLE_NAME_ALREADY_EXISTS }
    }
    Object.assign(role, updateBody);
    await role.save();
    return { data: role, code: CONSTANT.SUCCESSFUL, message: CONSTANT.ROLE_UPDATE };
};

/**
 * Delete role by id
 * @param {ObjectId} roleId
 * @returns {Promise<Roles>}
 */
const deleteRoleById = async (roleId) => {
    const role = await getRoleById(roleId);
    if (!role) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.ROLE_NOT_FOUND }
    }
    // role.status = role.status == 0 ? 1 : 0;
    role.isDelete = 0;
    await role.save();
    console.log('check role===', role.isDelete)
    return { data: role, code: CONSTANT.SUCCESSFUL, message: CONSTANT.ROLE_DELETE_STATUS }
};

/**
 * Query for roles
 * @param {Object} options - Query options
 * @param {string} [options.searchBy] - Search By use for search
 * @returns {Promise<QueryResult>}
 */
const queryRolesWithoutPagination = async (options) => {
    var condition = { $and: [{ company: options.companyId, isDelete: 1 }] };
    if (options.searchBy && options.searchBy != 'undefined') {
        condition.$and.push({
            $or: [{
                name: {
                    $regex: ".*" + options.searchBy + ".*",
                    $options: "si"
                }
            }]
        })
    }
    // options['sort'] = { createdAt: -1 }
    const roles = await AdminRoles.find(condition);
    return roles;
};

module.exports = {
    createRole,
    queryRoles,
    getRoleById,
    updateRoleById,
    deleteRoleById,
    queryRolesWithoutPagination
};
