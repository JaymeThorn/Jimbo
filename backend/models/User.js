const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  runStats: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastRunDate: Date,
    totalDistance: {
      type: Number,
      default: 0
    },
    totalRuns: {
      type: Number,
      default: 0
    },
    personalRecords: {
      fastest5k: {
        time: Number,
        runId: mongoose.Schema.Types.ObjectId,
        date: Date
      },
      fastest10k: {
        time: Number,
        runId: mongoose.Schema.Types.ObjectId,
        date: Date
      },
      fastestHalfMarathon: {
        time: Number,
        runId: mongoose.Schema.Types.ObjectId,
        date: Date
      },
      fastestMarathon: {
        time: Number,
        runId: mongoose.Schema.Types.ObjectId,
        date: Date
      },
      longestRun: {
        distance: Number,
        runId: mongoose.Schema.Types.ObjectId,
        date: Date
      }
    }
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
