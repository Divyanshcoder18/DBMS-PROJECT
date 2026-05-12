const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedback
exports.createFeedback = async (req, res) => {
  const { mealType, rating, comments } = req.body;
  try {
    const feedback = new Feedback({
      user: req.user._id,
      mealType,
      rating,
      comments,
    });
    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedbacks with stats (Admin only)
// @route   GET /api/feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    // Basic aggregation for metrics
    const aggregation = await Feedback.aggregate([
      {
        $group: {
          _id: '$mealType',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      feedbacks,
      stats: aggregation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
