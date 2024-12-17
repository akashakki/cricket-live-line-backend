// Import Mongoose
const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');
var slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

// Define the schema
const IPLTeamSchema = new mongoose.Schema({
    totalSpend: {
        type: Number,
        default: null
    },
    purseLeft: {
        type: Number,
        default: null
    },
    playerCount: Number,
    overseaPlayerCount: Number,
    colorCode: String,
    name: String,
    slug: { type: String, slug: "name" },
    shortName: String,
    image: String,
    apiResponse: String,
    teamId: String,
    apiId: String,
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
}, {
    timestamps: true
});


IPLTeamSchema.set('toObject', { virtuals: true });
IPLTeamSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
IPLTeamSchema.plugin(toJSON);
IPLTeamSchema.plugin(mongoosePaginate);

// Create the model
const IPLTeam = mongoose.model('IPLTeam', IPLTeamSchema);

module.exports = IPLTeam;
