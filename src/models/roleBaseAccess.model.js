const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const mongoosePaginate = require('mongoose-paginate-v2');

const roleBaseAccessSchema = mongoose.Schema(
  {
    name: String,
    description: String,
    resources: [{
      url: {
        type: String,
        required: true
      },

      moduleName: {
        type: String,
        required: true
      },

      moduleId: {
        type: String,
        required: true
      },

      permissions: {
        type: [String],
        enum: ['add', 'edit', 'delete', 'view'], // Predefined permissions
        required: true
      }
    }],
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'company' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active
    isDelete: { type: Number, default: 1 }, //0 is delete, 1 is Active
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
roleBaseAccessSchema.set('toObject', { virtuals: true });
roleBaseAccessSchema.set('toJSON', { virtuals: true });
roleBaseAccessSchema.plugin(toJSON);
roleBaseAccessSchema.plugin(mongoosePaginate);

/**
 * Check if name is taken
 * @param {string} name - The user's name
 * @param {ObjectId} [excludeRoleId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
roleBaseAccessSchema.statics.isNameTaken = async function (name, excludeRoleId) {
  var object = {};
  if (excludeRoleId) {
    object = { name, _id: { $ne: excludeRoleId }, isDelete: 1 };
  } else {
    object = { name, isDelete: 1 };
  }
  const role = await this.findOne(object);
  return !!role;
};

/**
 * @typedef ROLEBASEACCESSCONTROL
 */
const ROLEBASEACCESSCONTROL = mongoose.model('role_base_access_control', roleBaseAccessSchema);

module.exports = ROLEBASEACCESSCONTROL;
