const express = require('express');
const adminAuth = require('../../../middlewares/adminAuth');
const validate = require('../../../middlewares/validate');
const roleValidation = require('../../../validations/role.validation');
const adminRoleController = require('../../../controllers/admin/role.controller');

const router = express.Router();

router
    .route('/')
    .post(adminAuth('createRole'), validate(roleValidation.createRole), adminRoleController.createRole)
    .get(adminAuth('getRoles'), validate(roleValidation.getRoles), adminRoleController.getRoles);

router
    .route('/:roleId')
    .get(adminAuth('getRole'), validate(roleValidation.getRole), adminRoleController.getRole)
    .patch(adminAuth('updateRole'), validate(roleValidation.updateRole), adminRoleController.updateRole)
    .delete(adminAuth('deleteRole'), validate(roleValidation.deleteRole), adminRoleController.deleteRole);

router
    .route('/list/dropdown')
    .get(adminAuth('dropdown'), adminRoleController.getRolesWithoutPagination);

module.exports = router;