const express = require('express');
const router = express.Router();
const { 
  createOutpass, 
  getMyOutpasses, 
  getAllOutpasses, 
  updateOutpassStatus 
} = require('../controllers/outpass.controller');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createOutpass)
  .get(protect, admin, getAllOutpasses);

router.route('/my')
  .get(protect, getMyOutpasses);

router.route('/:id')
  .put(protect, admin, updateOutpassStatus);

module.exports = router;
