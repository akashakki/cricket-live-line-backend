const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const VenueSchema = mongoose.Schema({
    venue_id: { type: Number, required: true, unique: true },
    name: { type: String, default: '' },
    place: { type: String, default: '' },
    opened: { type: String, default: '' },
    capacity: { type: String, default: '' },
    known_as: { type: String, default: '' },
    ends: { type: String, default: '' },
    location: { type: String, default: '' },
    time_zone: { type: String, default: '' },
    home_to: { type: String, default: '' },
    floodlights: { type: String, default: '' },
    curator: { type: String, default: '' },
    profile: { type: String, default: '' },
    image: { type: String, default: '' },
    temp_c: { type: Number },
    temp_f: { type: Number },
    weather: { type: String },
    weather_icon: { type: String },
    wind_mph: { type: Number },
    wind_kph: { type: Number },
    wind_dir: { type: String },
    humidity: { type: Number },
    cloud: { type: Number },
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
},
{
  timestamps: true
});


VenueSchema.set('toObject', { virtuals: true });
VenueSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
VenueSchema.plugin(toJSON);
VenueSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
VenueSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
  };

const Venue = mongoose.model("Venue", VenueSchema);

module.exports = Venue;
