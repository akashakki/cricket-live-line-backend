const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const CareerStatsSchema = new mongoose.Schema({
    match_type: { type: String, required: true },
    matches: { type: Number, required: true },
    inning: { type: Number, required: true },
    runs: { type: Number, required: true },
    balls: { type: Number, required: true },
    hundreds: { type: Number, required: true },
    fifty: { type: Number, required: true },
    high_score: { type: Number, required: true },
    sr: { type: Number, required: true },
    avg: { type: Number, required: true },
    fours: { type: Number, required: true },
    sixes: { type: Number, required: true },
    not_out: { type: Number, required: true },
    ducks: { type: Number, required: true },
    two_hundreds: { type: Number, required: true },
    three_hundreds: { type: Number, required: true },
    four_hundreds: { type: Number, required: true }
  }, { _id: false });
  
  const BowlingCareerSchema = new mongoose.Schema({
    match_type: { type: String, required: true },
    matches: { type: Number, required: true },
    inning: { type: Number, required: true },
    runs: { type: Number, required: true },
    balls: { type: Number, required: true },
    wkts: { type: Number, required: true },
    economy: { type: Number, required: true },
    avg: { type: Number, required: true },
    sr: { type: Number, required: true },
    bbi: { type: String, required: true },
    four_wkt: { type: Number, required: true },
    five_wkt: { type: Number, required: true },
    ten_wkt: { type: Number, required: true }
  }, { _id: false });

const PlayerSchema = mongoose.Schema({
    player_id: { type: String, required: true },
    name: { type: String, required: true },
    play_role: { type: String },
    image: { type: String },
    style_bating: { type: String },
    style_bowling: { type: String },
    born: { type: String },
    height: { type: String, default: '' },
    birth_place: { type: String },
    description: { type: String, default: '' },
    teams: { type: String },
    batting_career: { type: [CareerStatsSchema] },
    bowling_career: { type: [BowlingCareerSchema] },
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
},
{
  timestamps: true
});


PlayerSchema.set('toObject', { virtuals: true });
PlayerSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
PlayerSchema.plugin(toJSON);
PlayerSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
PlayerSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
  };

const Players = mongoose.model("Players", PlayerSchema);

module.exports = Players;
