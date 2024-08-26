const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const SportSchema = mongoose.Schema({
    sport_id: { type: Number, required: true, unique: true },
    sort_order: Number,
    name: String,
    image: String,
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
},
    {
        timestamps: true
    });


SportSchema.set('toObject', { virtuals: true });
SportSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
SportSchema.plugin(toJSON);
SportSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
SportSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
};

const SportModel = mongoose.model("sport", SportSchema);
async function inIt() {
    var success = await SportModel.countDocuments({});
    if (success == 0) {
        await new SportModel({ name: 'Cricket', sport_id: 4, sort_order: 1 }).save();
        await new SportModel({ name: 'Football', sport_id: 3, sort_order: 2 }).save();
        await new SportModel({ name: 'Tennis', sport_id: 2, sort_order: 3 }).save();
        await new SportModel({ name: 'Horse Racing', sport_id: 5, sort_order: 4 }).save();
        await new SportModel({ name: 'Greyhound Racing', sport_id: 6, sort_order: 5 }).save();
        await new SportModel({ name: 'Soccer', sport_id: 1, sort_order: 6 }).save();
    }
};

inIt();
module.exports = SportModel;
