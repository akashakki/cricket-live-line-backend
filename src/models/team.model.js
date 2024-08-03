const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const TeamsSchema = mongoose.Schema({
    team_id: { type: Number, required: true, unique: true },
    team_name: String,
    team_short: String,
    team_img: String,
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
},
{
  timestamps: true
});


TeamsSchema.set('toObject', { virtuals: true });
TeamsSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
TeamsSchema.plugin(toJSON);
TeamsSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
TeamsSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
  };

const TeamsModel = mongoose.model("teams", TeamsSchema);

module.exports = TeamsModel;
