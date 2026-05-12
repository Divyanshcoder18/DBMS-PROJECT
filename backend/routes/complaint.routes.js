const express = require('express');
const router = express.Router();
const { createComplaint, getMyComplaints, getAllComplaints, updateComplaintStatus } = require('../controllers/complaint.controller');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getAllComplaints)
  .post(protect, createComplaint);

router.get('/my', protect, getMyComplaints);

router.put('/:id', protect, admin, updateComplaintStatus);

module.exports = router;
