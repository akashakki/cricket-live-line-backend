const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const OodSeriesSchema = mongoose.Schema({
    bm: Number,
    SportName: String,
    seriesName: String,
    image: String,
    casino_id: String,
    adminMessage: String,
    InplayStatus: String,
    BetAllowTimeBefore: Number,
    IsBetAllow: String,
    backRateDiff: Number,
    layRateDiff: Number,
    series_id: Number,
    favMatchID: String,
    match_id: String,
    name: String,
    IsFancyAllow: String,
    start_date: String,
    matchVolumn: String,
    sport_id: String,
    market_id: String,
    runner_json: Array,
    matchType: String, // Inplay or Upcoming
    numWinners: Number,
    numRunners: Number,
    numActiveRunners: Number,
    isBookmaker: Boolean,
    matchFrom: String,
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
}, {
    timestamps: true
});


OodSeriesSchema.set('toObject', { virtuals: true });
OodSeriesSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
OodSeriesSchema.plugin(toJSON);
OodSeriesSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
OodSeriesSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
};

const OodSeriesModel = mongoose.model("OodSeries", OodSeriesSchema);

module.exports = OodSeriesModel;
