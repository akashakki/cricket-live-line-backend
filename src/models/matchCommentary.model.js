const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const matchCommentarySchema = mongoose.Schema({
    match_id: { type: Number, required: true },
    match_commentary: {
        type: Schema.Types.Mixed,  // Allows storing any type of data (string, number, object, etc.)
        default: {}
    }
}, {
    timestamps: true
});


matchCommentarySchema.set('toObject', { virtuals: true });
matchCommentarySchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
matchCommentarySchema.plugin(toJSON);
matchCommentarySchema.plugin(mongoosePaginate);

const MATCH_COMMENTARY = mongoose.model("match_commentary", matchCommentarySchema);

module.exports = MATCH_COMMENTARY;
