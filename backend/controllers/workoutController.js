const Workout = require('../models/Workout');

exports.getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.userId }).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createWorkout = async (req, res) => {
  try {
    const { date, exercises } = req.body;

    if (!exercises || exercises.length === 0) {
      return res.status(400).json({ error: 'At least one exercise is required' });
    }

    const workout = new Workout({
      userId: req.userId,
      date: date || Date.now(),
      exercises
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
