const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const pollSchema = new mongoose.Schema({
  match_id: { type: String },
  match_info: {
    match_type: { type: String },
    series: { type: String },
    venue: { type: String },
    team_a: { type: String },
    team_b: { type: String },
    head_to_head: {
      team_a_wins: { type: Number },
      team_b_wins: { type: Number }
    }
  },
  pre_match_polls: [
    {
      id: { type: String },
      question: { type: String },
      type: { type: String },
      options: [
        {
          id: { type: String },
          text: { type: String }
        }
      ],
      category: { type: String }
    }
  ],
  performance_prediction_polls: [
    {
      id: { type: String },
      question: { type: String },
      type: { type: String },
      options: [
        {
          id: { type: String },
          text: { type: String }
        }
      ],
      category: { type: String }
    }
  ],
  trivia_quiz: [
    {
      id: { type: String },
      question: { type: String },
      type: { type: String },
      options: [
        {
          id: { type: String },
          text: { type: String }
        }
      ],
      correct_answer: { type: String },
      difficulty: { type: String },
      category: { type: String },
      explanation: { type: String }
    }
  ],
  match_situation_predictions: [
    {
      id: { type: String },
      question: { type: String },
      type: { type: String },
      options: [
        {
          id: { type: String },
          text: { type: String }
        }
      ],
      category: { type: String }
    }
  ],
  is_status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active this is for Admin, 2 For Completed
  is_delete: { type: Number, default: 1 }, //0 is delete, 1 is Active this is for Admin
}, {
  timestamps: true
});

pollSchema.set('toObject', { virtuals: true });
pollSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
pollSchema.plugin(toJSON);
pollSchema.plugin(mongoosePaginate);

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;