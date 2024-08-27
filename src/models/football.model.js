const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const runnerSchema = new mongoose.Schema({
    selectionId: Number,
    handicap: Number,
    status: String,
    lastPriceTraded: Number,
    totalMatched: Number,
    adjustmentFactor: Number,
    ex: {
        availableToBack: [
            {
                price: {
                    type: Number,
                    set: v => isNaN(v) ? null : v // Set to null if 'NaN'
                },
                size: {
                    type: Number,
                    set: v => isNaN(v) ? null : v
                },
                line: String
            }
        ],
        availableToLay: [
            {
                price: {
                    type: Number,
                    set: v => isNaN(v) ? null : v // Set to null if 'NaN'
                },
                size: {
                    type: Number,
                    set: v => isNaN(v) ? null : v
                },
                line: String
            }
        ]
    },
    selectionName: String,
    sort_priority: Number,
    WinAndLoss: Number
});

const footballMatchSchema = new mongoose.Schema({
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
    runner_json: [runnerSchema],
    matchType: String, // Inplay or Upcoming
    numWinners: Number,
    numRunners: Number,
    numActiveRunners: Number,
    isBookmaker: Boolean,
    createdAt: { type: Date, default: Date.now }
});


footballMatchSchema.set('toObject', { virtuals: true });
footballMatchSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
footballMatchSchema.plugin(toJSON);
footballMatchSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
footballMatchSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
};

const FootBallModel = mongoose.model("football", footballMatchSchema);

module.exports = FootBallModel;
