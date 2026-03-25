const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'first_run',
      'first_5k',
      'first_10k',
      'first_half_marathon',
      'first_marathon',
      'streak_7',
      'streak_30',
      'streak_100',
      'distance_100km',
      'distance_500km',
      'distance_1000km',
      'fastest_5k',
      'fastest_10k',
      'early_bird',
      'night_owl'
    ],
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    value: Number,
    runId: mongoose.Schema.Types.ObjectId
  }
}, { timestamps: true });

achievementSchema.index({ userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
