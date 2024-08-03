const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const contactUsSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active
    isDelete: { type: Number, default: 1 }, //0 is delete, 1 is Active
},
{
  timestamps: true
});


contactUsSchema.set('toObject', { virtuals: true });
contactUsSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
contactUsSchema.plugin(toJSON);
contactUsSchema.plugin(mongoosePaginate);

const CONTACT = mongoose.model("contact_us", contactUsSchema);

module.exports = CONTACT;
