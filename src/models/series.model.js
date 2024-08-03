const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const SeriesSchema = new mongoose.Schema({
    series_id: { type: Number, required: true, unique: true },
    series: { type: String, required: true },
    series_type: { type: String, default: '' },
    series_date: { type: String, required: true },
    total_matches: { type: Number, default: 0 },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    image: { type: String, default: '' },
    month_wise: { type: String, default: '' },
    // pointTable: {
    //     data: { type: Array, default: [] }
    // },
    // squadsBySeriesId: {
    //     data: { type: Array, default: [] }
    // },
    // groupPointsTable: {
    //     data: { type: Array, default: [] }
    // },
    // manOfTheSeries: {
    //     data: { type: Array, default: [] }
    // },
    // venuesBySeriesId: {
    //     data: { type: Array, default: [] }
    // },
    // topThreePlayersBySeriesId: {
    //     data: {
    //         batsman: { type: Array, default: [] },
    //         bowler: { type: Array, default: [] }
    //     }
    // },
    // recentMatchesBySeriesId: {
    //     data: { type: Array, default: [] }
    // },
    // upcomingMatchesBySeriesId: {
    //     data: { type: Array, default: [] }
    // },
    // stats: {
    //     best_economy: { type: Object, default: {} },
    //     most_five_wickets: { type: Object, default: {} },
    //     most_bowling: { type: Object, default: {} },
    //     most_wickets: { type: Object, default: {} },
    //     most_nineties: { type: Object, default: {} },
    //     most_sixes: { type: Object, default: {} },
    //     most_fours: { type: Object, default: {} },
    //     most_fifty: { type: Object, default: {} },
    //     most_hundreds: { type: Object, default: {} },
    //     batting_sr: { type: Object, default: {} },
    //     batting_avg: { type: Object, default: {} },
    //     highest_scores: { type: Object, default: {} },
    //     most_runs: { type: Object, default: {} }
    // },
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
}, {
    timestamps: true
});

SeriesSchema.set('toObject', { virtuals: true });
SeriesSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
SeriesSchema.plugin(toJSON);
SeriesSchema.plugin(mongoosePaginate);

/**
 * Check if name is taken
 * @param {string} name - The user's name
 * @param {ObjectId} [excludeSeriesId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
SeriesSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeSeriesId) {
    const query = { [fieldName]: value };
    if (excludeSeriesId) {
      query._id = { $ne: excludeSeriesId };
    }
    const data = await this.findOne(query);
    return !!data;
};

const Series = mongoose.model("Series", SeriesSchema);

module.exports = Series;
