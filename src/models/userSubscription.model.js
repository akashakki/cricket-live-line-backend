const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSubscriptionSchema = mongoose.Schema({
  planName: { type: String, default: '' },
  services: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'our_service' },
    servicePrice: { type: Number, default: 1 },
    freeLimit: { type: Number, default: 0 },
    freeLimitDuration: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
      default: 'month'
    },
    freeApiHitsFrequency: { type: Number, default: 0 },
    creditCount: { type: Number, default: 1 },
    planPrice: { type: Number, default: 1 },
    isCustom: { type: Boolean, default: false }
  }],
  servicePlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'service_plan' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'company' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Changed to 'User'
  description: { type: String, default: '' },
  expireAt: { type: Date },
  status: { type: Number, default: 0 }, // Changed to 0 for active subscription
  isExpired: { type: Boolean, default: false },
  isDelete: { type: Number, default: 1 }, //0 is delete, 1 is Active
}, {
  timestamps: true,
});

userSubscriptionSchema.virtual('service', {
  ref: 'OurService',
  localField: '_id',
  foreignField: 'serviceId',
});


// add plugin that converts mongoose to json
userSubscriptionSchema.plugin(toJSON);
userSubscriptionSchema.plugin(mongoosePaginate);

/**
 * @typedef USERSUBSCRIPTION
 */
const UserSubscription = mongoose.model('user_subscription', userSubscriptionSchema);

module.exports = UserSubscription;