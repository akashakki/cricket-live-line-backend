const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const PlayerSchema = new mongoose.Schema({
    player_id: { type: Number },
    name: { type: String },
    play_role: { type: String },
    image: { type: String }
  });
  
  const TeamSchema = new mongoose.Schema({
    name: { type: String },
    short_name: { type: String },
    flag: { type: String },
    player: [PlayerSchema]
  });
  
  const PaceSpinSchema = new mongoose.Schema({
    total_matches: { type: Number },
    win_bat_first: { type: Number },
    win_bowl_first: { type: Number },
    pace_wkt: { type: Number },
    spin_wkt: { type: Number },
    pace_percent: { type: Number },
    spin_percent: { type: Number }
  });
  
  const TeamComparisonSchema = new mongoose.Schema({
    team_a_low_score: { type: String },
    team_a_high_score: { type: String },
    team_a_avg_score: { type: Number },
    team_a_win: { type: Number },
    team_b_low_score: { type: String },
    team_b_high_score: { type: String },
    team_b_avg_score: { type: Number },
    team_b_win: { type: Number }
  });
  
  const VenueWeatherSchema = new mongoose.Schema({
    temp_c: { type: Number },
    temp_f: { type: Number },
    weather: { type: String },
    weather_icon: { type: String },
    wind_mph: { type: Number },
    wind_kph: { type: Number },
    wind_dir: { type: String },
    humidity: { type: Number },
    cloud: { type: Number }
  });
  
  const MatchSchema = new mongoose.Schema({
    match_id: { type: Number, required: true, unique: true },
    series_id: { type: Number, required: true },
    series: { type: String, default: "" },
    match_date: { type: String, default: "" },
    match_time: { type: String, default: "" },
    matchs: { type: String, default: "" },
    venue_id: { type: Number },
    venue: { type: String, default: "" },
    is_hundred: { type: Number },
    series_type: { type: String, default: "" },
    match_type: { type: String, default: "" },
    match_status: String,
    fav_team: String,
    min_rate: String,
    max_rate: String,
    team_a_id: Number,
    team_a: { type: String, default: "" },
    team_a_short: { type: String, default: "" },
    team_a_img: { type: String, default: "" },
    team_b_id: Number,
    team_b: { type: String, default: "" },
    team_b_short: { type: String, default: "" },
    team_b_img: { type: String, default: "" },
    place: { type: String, default: "" },
    pace_spin: { type: PaceSpinSchema },
    venue_weather: { type: VenueWeatherSchema },
    toss: { type: String, default: "" },
    umpire: { type: String, default: "" },
    third_umpire: { type: String, default: "" },
    referee: { type: String, default: "" },
    man_of_match: { type: String, default: "" },
    man_of_match_player: { type: String, default: "" },
    result: { type: String, default: "" },
    toss_comparison: { type: mongoose.Schema.Types.Mixed },
    forms: { type: mongoose.Schema.Types.Mixed },
    head_to_head: { type: mongoose.Schema.Types.Mixed },
    team_comparison: { type: TeamComparisonSchema },
    weather: { type: mongoose.Schema.Types.Mixed },
    live: { type: mongoose.Schema.Types.Mixed },
    commentary: { type: mongoose.Schema.Types.Mixed },
    scorecard: { type: mongoose.Schema.Types.Mixed },
    oddshistory: { type: mongoose.Schema.Types.Mixed },
    squad: {
      team_a: { type: TeamSchema },
      team_b: { type: TeamSchema }
    },
    playing11: { type: mongoose.Schema.Types.Mixed },
    impactplayer: { type: mongoose.Schema.Types.Mixed }
  }, {
    timestamps: true
  });


MatchSchema.set('toObject', { virtuals: true });
MatchSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
MatchSchema.plugin(toJSON);
MatchSchema.plugin(mongoosePaginate);

/**
 * Check if name is taken
 * @param {string} name - The user's name
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
MatchSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
};

const Match = mongoose.model("Match", MatchSchema);

module.exports = Match;
