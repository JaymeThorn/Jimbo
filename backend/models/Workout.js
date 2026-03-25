const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  exercises: [{
    name: {
      type: String,
      required: true
    },
    sets: [{
      reps: {
        type: Number,
        required: true
      },
      weight: {
        type: Number,
        required: true
      }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
