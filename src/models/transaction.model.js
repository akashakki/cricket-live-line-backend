const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const mongoosePaginate = require('mongoose-paginate-v2');



const transactionSchema = mongoose.Schema({
    transactionId: { type: String },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'company' },
    pgTransactionId: { type: String },
    amount: { type: Number },
    currency: { type: String },
    paymentMethod: { type: String },
    paymentStatus: { type: String, default: 'pending' },
    paymentDate: { type: Date },
    paymentGateway: { type: String, default: 'razorpay' },
    status: { type: Number, default: 1 }, //0 is acive, 1 is inactive
    isDelete: { type: Number, default: 1 } //0 is delete, 1 is Active
}, {
    timestamps: true,
});

// add plugin that converts mongoose to json
transactionSchema.plugin(toJSON);
transactionSchema.plugin(mongoosePaginate);

/**
 * @typedef CREDITAPIHIT
 */

const TRANSACTION = mongoose.model('transaction', transactionSchema);

module.exports = TRANSACTION;
