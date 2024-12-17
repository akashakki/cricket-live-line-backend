// Import Mongoose
const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');
var slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

// Define the schema
const AuctionPlayerSchema = new mongoose.Schema({
    player_id: String,
    slug: { type: String, slug: "name" },
    basePrice: {
        type: Number,
        default: null
    },
    soldPrice: {
        type: Number,
        default: null
    },
    isCappedPlayer: Boolean,
    isOverseas: Boolean,
    iplTeamName: String,
    iplTeamName_short: String,
    iplTeamImage: String,
    auctionStatus: String, //s for Sold, us for unsold, r for Retained
    primaryTeamName: String,
    primaryTeamName_short: String,
    primaryTeamFlag: String,
    name: String,
    image: String,
    teamJerseyImage: String,
    countryName: String,
    countryName_short: String,
    countryFlag: String,
    play_role: String,
    apiResponse: String,
    apiPlayerId: String,
    is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin
    is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
}, {
    timestamps: true
});


AuctionPlayerSchema.set('toObject', { virtuals: true });
AuctionPlayerSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
AuctionPlayerSchema.plugin(toJSON);
AuctionPlayerSchema.plugin(mongoosePaginate);

// Create the model
const AuctionPlayer = mongoose.model('AuctionPlayer', AuctionPlayerSchema);

module.exports = AuctionPlayer;
