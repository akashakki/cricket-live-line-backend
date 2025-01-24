const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const matchBallByBallSchema = mongoose.Schema({
    match_id: { type: Number, required: true },
    match_odd_history: String
}, {
    timestamps: true
});


matchBallByBallSchema.set('toObject', { virtuals: true });
matchBallByBallSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
matchBallByBallSchema.plugin(toJSON);
matchBallByBallSchema.plugin(mongoosePaginate);

const MatchBallByBall = mongoose.model("match_ball_by_ball", matchBallByBallSchema);

module.exports = MatchBallByBall;
