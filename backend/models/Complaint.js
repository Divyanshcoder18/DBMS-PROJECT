const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Electricity', 'Water', 'WiFi', 'Maintenance', 'Mess', 'Other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending',
  },
  adminComment: {
    type: String,
  },
}, {
  timestamps: true,
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
