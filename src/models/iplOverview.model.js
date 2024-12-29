// Import Mongoose
const mongoose = require("mongoose");
// var Schema = mongoose.Schema;
// var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');
var slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

// Define the schema
const IPLOverviewSchema = new mongoose.Schema({
    totalMoneySpent: {
        type: Number,
        default: null
    },
    totalOverseasPlayer: {
        type: Number,
        default: null
    },
    totalRegisteredPlayer: {
        type: Number,
        default: null
    },
    totalSoldPlayer: {
        type: Number,
        default: null
    },
    totalUnSoldPlayer: {
        type: Number,
        default: null
    },
    totalRTMUsed: {
        type: Number,
        default: null
    },
    apiResponse: String,
    overviewType: {type: String, default: 'ipl'}, //ipl, wpl
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
}, {
    timestamps: true
});


IPLOverviewSchema.set('toObject', { virtuals: true });
IPLOverviewSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
IPLOverviewSchema.plugin(toJSON);
IPLOverviewSchema.plugin(mongoosePaginate);

// Create the model
const IPLOverview = mongoose.model('IPLOverview', IPLOverviewSchema);

module.exports = IPLOverview;
