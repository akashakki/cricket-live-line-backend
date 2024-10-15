const mongoose = require("mongoose");
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const ApiUsageSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User making the request
  apiEndpoint: { type: String, required: true }, // The API endpoint being called
  method: { type: String, required: true }, // The HTTP method (GET, POST, etc.)
  count: { type: Number, default: 1 }, // Number of times the API was called
  firstUsedAt: { type: Date, required: true }, // When the API was first called
  lastUsedAt: { type: Date, required: true }, // When the API was last called
  ipAddress: { type: String }, // User's IP address
  token: { type: String }, // User's IP address
  domain: { type: String }, // User's IP address
  date: { type: Date, required: true }, // Date of the API call (day-wise tracking)
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Set virtuals to include in JSON and Object representations
ApiUsageSchema.set('toObject', { virtuals: true });
ApiUsageSchema.set('toJSON', { virtuals: true });

// Add plugin that converts mongoose to JSON
ApiUsageSchema.plugin(toJSON);
ApiUsageSchema.plugin(mongoosePaginate);

// Pre-save hook to set the date field to the start of the day for daily tracking
ApiUsageSchema.pre('save', function (next) {
  const currentDate = new Date();
  this.date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()); // Set date to 00:00:00 of current day
  next();
});

const ApiUsageModel = mongoose.model("ApiUsage", ApiUsageSchema);

module.exports = ApiUsageModel;
