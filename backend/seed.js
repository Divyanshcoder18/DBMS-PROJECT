const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Menu = require('./models/Menu');

dotenv.config({ path: './.env' });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelDB');
    console.log('Connected to DB');

    // 1. Create Test Admin if not exists
    const adminExists = await User.findOne({ email: 'admin@hostel.com' });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@hostel.com',
        password: 'adminpassword',
        role: 'admin'
      });
      console.log('Created Admin: admin@hostel.com / adminpassword');
    }

    // 2. Create Today's Menu
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const menuExists = await Menu.findOne({ date: today, mealType: 'Breakfast' });
    if (!menuExists) {
      await Menu.create([
        { date: today, mealType: 'Breakfast', items: 'Masala Dosa, Coconut Chutney, Filter Coffee' },
        { date: today, mealType: 'Lunch', items: 'Paneer Butter Masala, Roti, Dal Tadka, Jeera Rice' },
        { date: today, mealType: 'Dinner', items: 'Veg Pulao, Raita, Papad, Custard' }
      ]);
      console.log('Pre-populated Today\'s Menu Successfully!');
    } else {
      console.log('Today\'s Menu already exists.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
