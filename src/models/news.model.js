const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const NewsSchema = mongoose.Schema({
    news_id: { type: Number, required: true },
    series_id: Number,
    title: { type: String },
    description: { type: String },
    image: { type: String },
    pub_date: { type: String },
    new_date: { type: Date },
    content: { type: [String] },
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
},
{
  timestamps: true
});


NewsSchema.set('toObject', { virtuals: true });
NewsSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
NewsSchema.plugin(toJSON);
NewsSchema.plugin(mongoosePaginate);

/**
 * Check if is taken
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// Static method to check if a field value is taken
NewsSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const data = await this.findOne(query);
    return !!data;
  };

const NewsModel = mongoose.model("News", NewsSchema);

module.exports = NewsModel;
