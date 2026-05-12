const Complaint = require('../models/Complaint');

// @desc    Create new complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const complaint = new Complaint({
      user: req.user._id,
      title,
      description,
      category,
    });
    const createdComplaint = await complaint.save();
    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my complaints
// @route   GET /api/complaints/my
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints (Admin only)
// @route   GET /api/complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate('user', 'name email hostelName roomNumber')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status (Admin only)
// @route   PUT /api/complaints/:id
exports.updateComplaintStatus = async (req, res) => {
  const { status, adminComment } = req.body;
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (complaint) {
      complaint.status = status || complaint.status;
      complaint.adminComment = adminComment || complaint.adminComment;

      const updatedComplaint = await complaint.save();
      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
