const express = require('express');
const router = express.Router();
const { upsertMenu, getMenus } = require('../controllers/menu.controller');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMenus)
  .post(protect, admin, upsertMenu);

module.exports = router;
