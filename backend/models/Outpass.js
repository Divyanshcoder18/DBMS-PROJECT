const mongoose = require('mongoose');

const outpassSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  passCode: {
    type: String,
    required: true,
    unique: true,
  }
}, {
  timestamps: true,
});

const Outpass = mongoose.model('Outpass', outpassSchema);
module.exports = Outpass;
