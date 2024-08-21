const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const MatchSessionSchema = new mongoose.Schema({
    match_id: String,
    fancyStatus: String,
    fancy_category: String,
    SelectionId: String,
    start_date: String,
    adminMessage: {
        type: String,
        default: ''
    },
    IsBetAllow: {
        type: String,
        default: ''
    },
    BetAllowTimeBefore: {
        type: Number,
        default: 0
    },
    minStack: {
        type: Number,
        default: 0
    },
    maxStack: {
        type: Number,
        default: 0
    },
    maxProfit: {
        type: Number,
        default: 0
    },
    RunnerName: String,
    BackPrice1: {
        type: Number,
        default: 0
    },
    BackSize1: {
        type: Number,
        default: 0
    },
    LayPrice1: {
        type: Number,
        default: 0
    },
    LaySize1: {
        type: Number,
        default: 0
    },
    inplayStatus: {
        type: String,
        default: ''
    },
    scorePostion: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: true
});


MatchSessionSchema.set('toObject', { virtuals: true });
MatchSessionSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
MatchSessionSchema.plugin(toJSON);
MatchSessionSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
MatchSessionSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
};

const OodSeriesModel = mongoose.model("OodMatchSession", MatchSessionSchema);

module.exports = OodSeriesModel;
