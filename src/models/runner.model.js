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
                price: Number,
                size: Number
            }
        ],
        availableToLay: [
            {
                price: Number,
                size: Number
            }
        ]
    },
    selectionName: String,
    sort_priority: Number,
    WinAndLoss: Number
});

const matchDetailsSchema = new mongoose.Schema({
    BetAllowTimeBefore: Number,
    isbetalowaftermatchodds: String,
    SportName: String,
    favMatchID: String,
    adminMessage: String,
    market_type: String,
    marketMinStack: Number,
    marketMaxStack: Number,
    marketMaxProfit: Number,
    marketMaxLoss: Number,
    marketMaxExposure: Number,
    marketMinExposure: Number,
    InplayStatus: String,
    MainTV: String,
    PlayTv1: String,
    PlayTv2: String,
    PlayTv3: String,
    PlayTv4: String,
    graphics: String,
    IsBetAllow: String,
    SportminOddsLimt: Number,
    SportmaxOddsLimt: Number,
    sportScore: String,
    sportGraphic: String,
    sportShowLastResult: String,
    sportShowTV: String,
    backRateDiff: Number,
    layRateDiff: Number,
    series_id: Number,
    match_id: String,
    name: String,
    start_date: String,
    matchVolumn: Number,
    marketCount: Number,
    marketName: String,
    sport_id: Number,
    market_id: String,
    runner_json: [runnerSchema],
    tv_id: String,
    seriesName: String,
    bxyz: String,
    lxyz: String,
    vxyz: String
});

const otherMarketSchema = new mongoose.Schema({
    BetAllowTimeBefore: Number,
    isbetalowaftermatchodds: String,
    market_type: String,
    SportName: String,
    adminMessage: String,
    marketMinStack: Number,
    marketMaxStack: Number,
    marketMaxProfit: Number,
    marketMaxLoss: Number,
    marketMaxExposure: Number,
    marketMinExposure: Number,
    InplayStatus: String,
    MainTV: String,
    PlayTv1: String,
    PlayTv2: String,
    PlayTv3: String,
    PlayTv4: String,
    graphics: String,
    IsBetAllow: String,
    SportminOddsLimt: Number,
    SportmaxOddsLimt: Number,
    sportScore: String,
    sportGraphic: String,
    sportShowLastResult: String,
    sportShowTV: String,
    backRateDiff: Number,
    layRateDiff: Number,
    series_id: Number,
    match_id: String,
    name: String,
    start_date: String,
    matchVolumn: Number,
    marketCount: Number,
    marketName: String,
    sport_id: Number,
    market_id: String,
    runner_json: [runnerSchema],
    bxyz: String,
    lxyz: String,
    vxyz: String
});

const userSportSettingsSchema = new mongoose.Schema({
    sport_id: Number,
    name: String,
    is_manual: String,
    is_show_last_result: String,
    is_show_tv: String,
    is_live_sport: String,
    score: String,
    graphic: String,
    one_click_stack: String,
    match_stack: String
});

const matchSchema = new mongoose.Schema({
    matchId: String,
    MatchDetails: matchDetailsSchema,
    OtherMarketList: [otherMarketSchema],
    BookerMakerMarket: matchDetailsSchema,
    bm: [mongoose.Schema.Types.Mixed],
    UserSportSettings: [userSportSettingsSchema],
    createdAt: { type: Date, default: Date.now }
});


matchSchema.set('toObject', { virtuals: true });
matchSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
matchSchema.plugin(toJSON);
matchSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
matchSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
};

const MatchRunnerModel = mongoose.model("Matchrunner", matchSchema);

module.exports = MatchRunnerModel;
