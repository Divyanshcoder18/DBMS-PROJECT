const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analytics.controller');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/dashboard')
  .get(protect, admin, getDashboardAnalytics);

module.exports = router;
