const mongoose = require("mongoose");
const { Schema } = mongoose;
const { toJSON } = require("./plugins");
const mongoosePaginate = require("mongoose-paginate-v2");

const MatchCommentarySchema = new Schema(
    {
        match_id: { type: Number, required: true },
        apiResponse: { type: String }, // Map for dynamic innings
    },
    { timestamps: true }
);

// Add virtuals and plugins
MatchCommentarySchema.set("toObject", { virtuals: true });
MatchCommentarySchema.set("toJSON", { virtuals: true });

MatchCommentarySchema.plugin(toJSON);
MatchCommentarySchema.plugin(mongoosePaginate);

const MATCH_COMMENTARY = mongoose.model("match_commentary", MatchCommentarySchema);

module.exports = MATCH_COMMENTARY;
