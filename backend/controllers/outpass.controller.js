const Outpass = require('../models/Outpass');
const crypto = require('crypto');

// @desc    Create new outpass
// @route   POST /api/outpass
// @access  Private/Student
const createOutpass = async (req, res) => {
  try {
    const { startDate, endDate, destination, reason } = req.body;
    
    // Simple random unique passCode generator
    const passCode = `OP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const outpass = await Outpass.create({
      user: req.user._id,
      startDate,
      endDate,
      destination,
      reason,
      passCode
    });

    res.status(201).json(outpass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in student's outpasses
// @route   GET /api/outpass/my
// @access  Private/Student
const getMyOutpasses = async (req, res) => {
  try {
    const outpasses = await Outpass.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(outpasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all outpasses
// @route   GET /api/outpass
// @access  Private/Admin
const getAllOutpasses = async (req, res) => {
  try {
    const outpasses = await Outpass.find({})
      .populate('user', 'name hostelName roomNumber email')
      .sort({ createdAt: -1 });
    res.json(outpasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update outpass status
// @route   PUT /api/outpass/:id
// @access  Private/Admin
const updateOutpassStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const outpass = await Outpass.findById(req.params.id);

    if (!outpass) {
      return res.status(404).json({ message: 'Outpass not found' });
    }

    outpass.status = status;
    const updatedOutpass = await outpass.save();
    res.json(updatedOutpass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOutpass,
  getMyOutpasses,
  getAllOutpasses,
  updateOutpassStatus
};
