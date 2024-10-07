const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const matchSquadSchema = mongoose.Schema({
    match_id: { type: Number, required: true },
    match_squads: {
        type: Schema.Types.Mixed,  // Allows storing any type of data (string, number, object, etc.)
        default: {}
    }
}, {
    timestamps: true
});


matchSquadSchema.set('toObject', { virtuals: true });
matchSquadSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
matchSquadSchema.plugin(toJSON);
matchSquadSchema.plugin(mongoosePaginate);

const MATCHAQUAD = mongoose.model("match_squad", matchSquadSchema);

module.exports = MATCHAQUAD;
