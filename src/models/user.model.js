const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = mongoose.Schema(
  {
    name: String,
    email: String,
    diallingCode: String,
    phone: String,
    alternatePhone: String,
    password: String,
    profilePicture: String,
    dob: { type: Date, default: null },
    emailVerificationStatus: { type: Boolean, default: false },
    userType: { type: String, default: 'user', enum: ['user', 'company', 'staff'] },
    // companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'company' },
    companyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "company" }],
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
    loginWith: { type: String, default: '' },
    lastLogin: { type: Date, default: null },
    isStatus: { type: Number, default: 1 }, //0 is Inactive, 1 is Active
    isDelete: { type: Number, default: 1 }, //0 is delete, 1 is Active
  },
  {
    timestamps: true
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(mongoosePaginate);

/**
 * Check if mobile number is taken
 * @param {string} phone - The user's mobile number
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isPhoneTaken = async function (phone, excludeUserId) {
  const user = await this.findOne({ phone, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password.toString(), user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef USER
 */

const USER = mongoose.model("user", userSchema);

module.exports = USER;
