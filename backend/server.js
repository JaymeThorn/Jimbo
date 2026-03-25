require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const templateRoutes = require('./routes/templates');
const statsRoutes = require('./routes/stats');
const runRoutes = require('./routes/runs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/runs', runRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
