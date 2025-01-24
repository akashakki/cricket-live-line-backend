const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const PlayingXiByMatchSchema = mongoose.Schema({
    match_id: { type: Number, required: true, unique: true },
    team_a: {
        name: String,
        short_name: String,
        flag: String,
        player: [{
            player_id: String,
            name: String,
            play_role: String,
            image: String
        }]
    },
    team_b: {
        name: String,
        short_name: String,
        flag: String,
        player: [{
            player_id: String,
            name: String,
            play_role: String,
            image: String
        }]
    },
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
}, { timestamps: true });


PlayingXiByMatchSchema.set('toObject', { virtuals: true });
PlayingXiByMatchSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
PlayingXiByMatchSchema.plugin(toJSON);
PlayingXiByMatchSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
PlayingXiByMatchSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
};

const SportModel = mongoose.model("playingXi", PlayingXiByMatchSchema);

module.exports = SportModel;
