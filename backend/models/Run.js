const mongoose = require('mongoose');

const runSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  distance: {
    type: Number, // in kilometers
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  pace: {
    type: Number, // minutes per km
    required: true
  },
  route: [{
    lat: Number,
    lng: Number,
    timestamp: Number,
    elevation: Number, // meters
    speed: Number // km/h
  }],
  splits: [{
    distance: Number, // km
    time: Number, // seconds
    pace: Number // min/km
  }],
  elevationGain: {
    type: Number,
    default: 0
  },
  elevationLoss: {
    type: Number,
    default: 0
  },
  heartRate: {
    avg: Number,
    max: Number,
    zones: {
      zone1: Number, // % time in zone
      zone2: Number,
      zone3: Number,
      zone4: Number,
      zone5: Number
    }
  },
  weather: {
    temp: Number,
    condition: String,
    humidity: Number
  },
  paceZone: {
    type: String,
    enum: ['easy', 'tempo', 'threshold', 'interval', 'recovery']
  },
  routeName: String, // for segment tracking
  isShared: {
    type: Boolean,
    default: true
  },
  notes: String,
  kudos: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Index for finding personal records
runSchema.index({ userId: 1, distance: 1, duration: 1 });
runSchema.index({ userId: 1, date: -1 });
runSchema.index({ routeName: 1, duration: 1 }); // for segment leaderboards

module.exports = mongoose.model('Run', runSchema);
