const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comments: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
