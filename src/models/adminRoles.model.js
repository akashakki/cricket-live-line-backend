const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const mongoosePaginate = require('mongoose-paginate-v2');

const adminRolesSchema = mongoose.Schema({
    name: String,
    resource: [{
        moduleName: String,
        moduleId: String,
        permissions: []
    }],
    status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active
    isDelete: { type: Number, default: 1 } //0 is delete, 1 is Active
}, {
    timestamps: true,
});

// add plugin that converts mongoose to json
adminRolesSchema.plugin(toJSON);
adminRolesSchema.plugin(mongoosePaginate);

/**
 * Check if name is taken
 * @param {string} name - The user's name
 * @param {ObjectId} [excludeRoleId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
adminRolesSchema.statics.isNameTaken = async function (name, excludeRoleId) {
    var object = {};
    if (excludeRoleId) {
        object = { name, _id: { $ne: excludeRoleId } }
    } else {
        object = { name }
    }
    const role = await this.findOne(object);
    return !!role;
};

/**
 * @typedef AdminRoles
 */
const AdminRoles = mongoose.model('adminroles', adminRolesSchema);

module.exports = AdminRoles;
