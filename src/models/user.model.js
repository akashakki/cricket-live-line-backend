const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
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
    companyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "company" }],
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
    loginWith: { type: String, default: '' },
    lastLogin: { type: Date, default: null },
    apiKey: String,
    apiKeySecret: String,

    isStatus: { type: Number, default: 1 }, // 0 is Inactive, 1 is Active
    isDelete: { type: Number, default: 1 }, // 0 is delete, 1 is Active
    // Additional Fields
    ipAddress: [{ type: String }], // To store the user's IP address
    domains: [{ type: String }], // To store allowed domains for the user
    hiddenValue: String, // To store a hidden value if necessary

    // Reference to Subscription
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'subscription' }
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
  return bcrypt.compare(password.toString(), this.password);
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Pre-save hook to generate apiKey and apiKeySecret
userSchema.pre('save', async function (next) {
  if (this.isNew || !this.apiKey || !this.apiKeySecret) {
    try {
      // Generate a unique API key
      this.apiKey = crypto.randomBytes(16).toString('hex');

      // Generate a unique API secret key
      this.apiKeySecret = crypto.randomBytes(32).toString('hex');

      // Ensure the apiKey and apiKeySecret are unique
      const existingUser = await mongoose.models.user.findOne({
        $or: [{ apiKey: this.apiKey }, { apiKeySecret: this.apiKeySecret }]
      });

      // If the generated keys are not unique, regenerate them
      if (existingUser) {
        return this.save();
      }
    } catch (err) {
      return next(err);
    }
  }

  next();
});

/**
 * @typedef USER
 */

const USER = mongoose.model("user", userSchema);

async function inIt() {
  var success = await USER.countDocuments({});
  if (success == 0) {
    await new USER({ name: 'Demo Account', email: 'demo@yopmail.com', password: '12345678', type: 'company' }).save();
  }
};

inIt();

module.exports = USER;
