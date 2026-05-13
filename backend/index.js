const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/feedback', require('./routes/feedback.routes'));
app.use('/api/menu', require('./routes/menu.routes'));
app.use('/api/outpass', require('./routes/outpass.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

app.get('/', (req, res) => {
  res.send('Smart Hostel Management API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
