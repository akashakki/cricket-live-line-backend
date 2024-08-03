const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');
const validator = require('validator');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
        validate(value) {
            if (!validator.isInt(value.toString(), { min: 1, max: 5 })) {
                throw new Error('Rating must be an integer between 1 and 5');
            }
        }
    },
    review: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 1, // 0 is Inactive, 1 is Active
        enum: [0, 1]
    },
    isDelete: {
        type: Number,
        default: 1, // 0 is Deleted, 1 is Active
        enum: [0, 1]
    },
    isAnonymous: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

reviewSchema.index({ userId: 1, companyId: 1 }, { unique: true }); // Ensure one review per user per company

reviewSchema.set('toObject', { virtuals: true });
reviewSchema.set('toJSON', { virtuals: true });

// Add plugin that converts mongoose to json
reviewSchema.plugin(toJSON);
reviewSchema.plugin(mongoosePaginate);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
