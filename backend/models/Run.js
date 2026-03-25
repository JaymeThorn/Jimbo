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
    timestamp: Number
  }],
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Run', runSchema);
