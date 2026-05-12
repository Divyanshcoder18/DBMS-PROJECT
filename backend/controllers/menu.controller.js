const Menu = require('../models/Menu');

// @desc    Add/Update daily menu
// @route   POST /api/menu
exports.upsertMenu = async (req, res) => {
  const { date, mealType, items } = req.body;
  try {
    const searchDate = new Date(date || new Date());
    searchDate.setHours(0,0,0,0);

    // Check for existing
    let menu = await Menu.findOne({ date: searchDate, mealType });

    if (menu) {
      menu.items = items;
      await menu.save();
    } else {
      menu = await Menu.create({ date: searchDate, mealType, items });
    }

    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active menus for a specific date range
// @route   GET /api/menu
exports.getMenus = async (req, res) => {
  try {
    const dateStr = req.query.date ? new Date(req.query.date) : new Date();
    dateStr.setHours(0,0,0,0);
    
    const menus = await Menu.find({ date: dateStr });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
