const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const OddsMatchDetailsSchema = new mongoose.Schema({
    "match_id": "string", // Unique identifier for the match
    "matchStats": {
        "p1b": "number", // Example data
        "p2b": "number",
        "p1r": "number",
        "p2r": "number",
        "w": "number",
        "s": "number",
        "lb": "string",
        "p14": "number",
        "p24": "number",
        "rb": "number",
        "p16": "number",
        "p26": "number",
        "cb": "string",
        "ap": "string",
        "recentBalls": [
            ["string", "string", "string", "string", "string", "string"] // Recent ball data
        ]
    },
    "matchSummary": {
        "lw": "string",
        "b": "string",
        "pp": "number",
        "p1": "string",
        "p2": "string",
        "st": "string", // Status, e.g., "SCO"
        "c": "string"
    },
    "matchDetails": {
        "flag1": "string",
        "flag2": "string",
        "match_number": "number",
        "order": "number",
        "rate": "string",
        "rate2": "string",
        "rate_team": "string",
        "target": "number",
        "t1": "string", // Team 1
        "t2": "string", // Team 2
        "team1": "string",
        "team2": "string",
        "title": "string",
        "score": "string",
        "score2": "string",
        "wicket": "string",
        "wicket2": "string",
        "ballsdone": "number",
        "ballsdone2": "number"
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
