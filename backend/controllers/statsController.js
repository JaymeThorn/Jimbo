const Workout = require('../models/Workout');

exports.getStats = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.userId }).sort({ date: 1 });
    
    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedDates = workouts
      .map(w => new Date(w.date).setHours(0, 0, 0, 0))
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => b - a);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      
      if (sortedDates[i] === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    // Calculate PRs
    const prs = {};
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
        if (!prs[exercise.name] || maxWeight > prs[exercise.name]) {
          prs[exercise.name] = maxWeight;
        }
      });
    });
    
    // Progress data for charts
    const progressData = {};
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (!progressData[exercise.name]) {
          progressData[exercise.name] = [];
        }
        const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
        progressData[exercise.name].push({
          date: workout.date,
          weight: maxWeight
        });
      });
    });
    
    res.json({ streak, prs, progressData, totalWorkouts: sortedDates.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
