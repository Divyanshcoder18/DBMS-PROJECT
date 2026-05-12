const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback } = require('../controllers/feedback.controller');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getAllFeedback)
  .post(protect, createFeedback);

module.exports = router;
