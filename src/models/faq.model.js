const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');
const validator = require('validator');

const faqSchema = mongoose.Schema({
    question: { type: String, required: true },
    answer: String,
    status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active
    isDelete: { type: Number, default: 1 }, //0 is delete, 1 is Active
},
{
  timestamps: true
});


faqSchema.set('toObject', { virtuals: true });
faqSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
faqSchema.plugin(toJSON);
faqSchema.plugin(mongoosePaginate);

/**
 * Check if name is taken
 * @param {string} name - The user's name
 * @param {ObjectId} [excludeFAQId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
faqSchema.statics.isQuestionTaken = async function (question, excludeFAQId) {
  let query = {
    question: new RegExp(`^${validator.escape(question)}$`, 'i'),
    isDelete: 1,
    status: 1
  };

  // Exclude the current subcategory by ID if provided
  if (excludeFAQId) {
    query._id = { $ne: excludeFAQId };
  }

  const faq = await this.findOne(query);
  return !!faq;
};

const FAQ = mongoose.model("faq", faqSchema);

module.exports = FAQ;
