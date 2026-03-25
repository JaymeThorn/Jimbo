const Run = require('../models/Run');
const User = require('../models/User');
const analytics = require('../utils/runAnalytics');

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
    
    // Find similar routes for comparison
    const allRuns = await Run.find({ userId: req.userId });
    const similarRoutes = analytics.findSimilarRoutes(run.route, allRuns.filter(r => r._id.toString() !== run._id.toString()));
    
    res.json({ ...run.toObject(), similarRoutes });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createRun = async (req, res) => {
  try {
    const { date, distance, duration, pace, route, notes, routeName, heartRate } = req.body;
    
    // Calculate analytics
    const splits = analytics.calculateSplits(route, distance);
    const elevation = analytics.calculateElevation(route);
    const paceZone = analytics.determinePaceZone(pace);
    const weather = await analytics.getWeather(route?.[0]?.lat, route?.[0]?.lng);
    
    const run = new Run({
      userId: req.userId,
      date: date || Date.now(),
      distance,
      duration,
      pace,
      route,
      splits,
      elevationGain: elevation.gain,
      elevationLoss: elevation.loss,
      paceZone,
      weather,
      routeName,
      heartRate,
      notes
    });

    await run.save();
    
    // Update user stats
    await analytics.updateUserStats(User, req.userId, run);
    
    res.status(201).json(run);
  } catch (error) {
    console.error('Create run error:', error);
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
    const user = await User.findById(req.userId);
    const runs = await Run.find({ userId: req.userId });
    
    // Weekly/monthly totals
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const weeklyRuns = runs.filter(r => new Date(r.date) >= weekAgo);
    const monthlyRuns = runs.filter(r => new Date(r.date) >= monthAgo);
    
    const weeklyDistance = weeklyRuns.reduce((sum, run) => sum + run.distance, 0);
    const monthlyDistance = monthlyRuns.reduce((sum, run) => sum + run.distance, 0);
    
    const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);
    const totalDuration = runs.reduce((sum, run) => sum + run.duration, 0);
    const avgPace = runs.length > 0 ? runs.reduce((sum, run) => sum + run.pace, 0) / runs.length : 0;
    const longestRun = runs.length > 0 ? Math.max(...runs.map(r => r.distance)) : 0;
    
    // Pace zone distribution
    const paceZones = {
      recovery: runs.filter(r => r.paceZone === 'recovery').length,
      easy: runs.filter(r => r.paceZone === 'easy').length,
      tempo: runs.filter(r => r.paceZone === 'tempo').length,
      threshold: runs.filter(r => r.paceZone === 'threshold').length,
      interval: runs.filter(r => r.paceZone === 'interval').length
    };
    
    res.json({
      totalRuns: runs.length,
      totalDistance: totalDistance.toFixed(2),
      totalDuration,
      avgPace: avgPace.toFixed(2),
      longestRun: longestRun.toFixed(2),
      weeklyDistance: weeklyDistance.toFixed(2),
      monthlyDistance: monthlyDistance.toFixed(2),
      currentStreak: user.runStats?.currentStreak || 0,
      longestStreak: user.runStats?.longestStreak || 0,
      personalRecords: user.runStats?.personalRecords || {},
      paceZones,
      monthlyChallenge: {
        target: 100,
        current: monthlyDistance,
        percentage: Math.min(100, (monthlyDistance / 100) * 100).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Get run stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSegmentLeaderboard = async (req, res) => {
  try {
    const { routeName } = req.params;
    
    const runs = await Run.find({ routeName })
      .populate('userId', 'email')
      .sort({ duration: 1 })
      .limit(10);
    
    res.json(runs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.shareRun = async (req, res) => {
  try {
    const run = await Run.findOne({ _id: req.params.id, userId: req.userId });
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }
    
    run.isShared = !run.isShared;
    await run.save();
    
    res.json(run);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFriendsRuns = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const friendIds = user.friends || [];
    
    const runs = await Run.find({
      userId: { $in: friendIds },
      isShared: true
    })
      .populate('userId', 'email')
      .sort({ date: -1 })
      .limit(20);
    
    res.json(runs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getHeatmapData = async (req, res) => {
  try {
    const runs = await Run.find({ userId: req.userId });
    
    // Flatten all route points
    const allPoints = runs.reduce((points, run) => {
      if (run.route) {
        return points.concat(run.route.map(p => [p.lat, p.lng]));
      }
      return points;
    }, []);
    
    res.json(allPoints);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
