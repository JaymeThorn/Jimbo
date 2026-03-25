const Run = require('../models/Run');

exports.getRuns = async (req, res) => {
  try {
    const runs = await Run.find({ userId: req.userId }).sort({ date: -1 });
    res.json(runs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRunById = async (req, res) => {
  try {
    const run = await Run.findOne({ _id: req.params.id, userId: req.userId });
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }
    res.json(run);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createRun = async (req, res) => {
  try {
    const { date, distance, duration, pace, route, notes } = req.body;
    
    const run = new Run({
      userId: req.userId,
      date: date || Date.now(),
      distance,
      duration,
      pace,
      route,
      notes
    });

    await run.save();
    res.status(201).json(run);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteRun = async (req, res) => {
  try {
    const run = await Run.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }
    res.json({ message: 'Run deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRunStats = async (req, res) => {
  try {
    const runs = await Run.find({ userId: req.userId });
    
    const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);
    const totalDuration = runs.reduce((sum, run) => sum + run.duration, 0);
    const avgPace = runs.length > 0 ? runs.reduce((sum, run) => sum + run.pace, 0) / runs.length : 0;
    const longestRun = runs.length > 0 ? Math.max(...runs.map(r => r.distance)) : 0;
    
    res.json({
      totalRuns: runs.length,
      totalDistance: totalDistance.toFixed(2),
      totalDuration,
      avgPace: avgPace.toFixed(2),
      longestRun: longestRun.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
