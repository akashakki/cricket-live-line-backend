const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const mongoosePaginate = require('mongoose-paginate-v2');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apiPurchaseDate: { type: Date, default: null },
  apiRenewalDate: { type: Date, default: null },
  paymentAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'pending', enum: ['pending', 'paid'] },
  subscriptionPlan: { type: String, required: true },
  subscriptionDetails: { type: String, default: '' },
  paymentDate: { type: Date, default: null } // Store the date when payment is made
}, {
  timestamps: true
});


// add plugin that converts mongoose to json
subscriptionSchema.plugin(toJSON);
subscriptionSchema.plugin(mongoosePaginate);

/**
 * @typedef USERSUBSCRIPTION
 */
const UserSubscription = mongoose.model('subscription', subscriptionSchema);

module.exports = UserSubscription;