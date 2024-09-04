const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const OddsMatchDetailsSchema = new mongoose.Schema({
    "match_id": String, // Unique identifier for the match
    score_widget_url: String,
    scorecard_id: Number,
    "matchStats": {
        "p1b": Number, // Example data
        "p2b": Number,
        "p1r": Number,
        "p2r": Number,
        "w": Number,
        "s": Number,
        "lb": String,
        "p14": Number,
        "p24": Number,
        "rb": Number,
        "p16": Number,
        "p26": Number,
        "cb": String,
        "ap": String,
        "recentBalls": [
            [String, String, String, String, String, String] // Recent ball data
        ]
    },
    "matchSummary": {
        "lw": String,
        "b": String,
        "pp": Number,
        "p1": String,
        "p2": String,
        "st": String, // Status, e.g., "SCO"
        "c": String
    },
    "matchDetails": {
        "flag1": String,
        "flag2": String,
        "match_number": Number,
        "order": Number,
        "rate": String,
        "rate2": String,
        "rate_team": String,
        "target": Number,
        "t1": String, // Team 1
        "t2": String, // Team 2
        "team1": String,
        "team2": String,
        "title": String,
        "score": String,
        "score2": String,
        "wicket": String,
        "wicket2": String,
        "ballsdone": Number,
        "ballsdone2": Number
    }
}, {
    timestamps: true
});


OddsMatchDetailsSchema.set('toObject', { virtuals: true });
OddsMatchDetailsSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
OddsMatchDetailsSchema.plugin(toJSON);
OddsMatchDetailsSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
OddsMatchDetailsSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
};

const OddsMatchDetailsModel = mongoose.model("OddsMatchDetails", OddsMatchDetailsSchema);

module.exports = OddsMatchDetailsModel;
