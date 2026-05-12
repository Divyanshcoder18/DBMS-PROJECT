const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
    required: true,
  },
  items: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
});

// Ensure only one menu type per day
menuSchema.index({ date: 1, mealType: 1 }, { unique: true });

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
