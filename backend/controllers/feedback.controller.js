const Feedback = require('../models/Feedback');
const Menu = require('../models/Menu');

exports.createFeedback = async (req, res) => {
  const { menuId, rating, comments } = req.body;
  try {
    const feedback = new Feedback({
      user: req.user._id,
      menu: menuId,
      rating,
      comments,
    });
    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate('user', 'name email')
      .populate('menu', 'mealType items date')
      .sort({ createdAt: -1 });
    
    // Updated aggregation to join the menu collection
    const aggregation = await Feedback.aggregate([
      {
        $lookup: {
          from: 'menus',
          localField: 'menu',
          foreignField: '_id',
          as: 'menuDetails'
        }
      },
      { $unwind: '$menuDetails' },
      {
        $group: {
          _id: '$menuDetails.mealType',
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
