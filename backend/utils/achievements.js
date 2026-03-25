const Achievement = require('../models/Achievement');

const ACHIEVEMENTS = {
  first_run: { name: 'First Run', description: 'Complete your first run', icon: '🏃' },
  first_5k: { name: 'First 5K', description: 'Run 5 kilometers', icon: '🎯' },
  first_10k: { name: 'First 10K', description: 'Run 10 kilometers', icon: '🏅' },
  first_half_marathon: { name: 'Half Marathon', description: 'Run 21.1 kilometers', icon: '🥈' },
  first_marathon: { name: 'Marathon', description: 'Run 42.2 kilometers', icon: '🥇' },
  streak_7: { name: '7 Day Streak', description: 'Run 7 days in a row', icon: '🔥' },
  streak_30: { name: '30 Day Streak', description: 'Run 30 days in a row', icon: '🔥🔥' },
  streak_100: { name: '100 Day Streak', description: 'Run 100 days in a row', icon: '🔥🔥🔥' },
  distance_100km: { name: '100km Club', description: 'Run 100 total kilometers', icon: '💯' },
  distance_500km: { name: '500km Club', description: 'Run 500 total kilometers', icon: '⭐' },
  distance_1000km: { name: '1000km Club', description: 'Run 1000 total kilometers', icon: '🌟' },
  fastest_5k: { name: 'Speed Demon 5K', description: 'Run 5K under 25 minutes', icon: '⚡' },
  fastest_10k: { name: 'Speed Demon 10K', description: 'Run 10K under 50 minutes', icon: '⚡⚡' },
  early_bird: { name: 'Early Bird', description: 'Run before 6 AM', icon: '🌅' },
  night_owl: { name: 'Night Owl', description: 'Run after 10 PM', icon: '🌙' }
};

exports.checkAchievements = async (User, userId, run) => {
  const user = await User.findById(userId);
  const newAchievements = [];

  try {
    // First run
    if (user.runStats.totalRuns === 1) {
      await createAchievement(userId, 'first_run', { runId: run._id });
      newAchievements.push(ACHIEVEMENTS.first_run);
    }

    // Distance milestones
    if (run.distance >= 5 && run.distance < 5.5) {
      const existing = await Achievement.findOne({ userId, type: 'first_5k' });
      if (!existing) {
        await createAchievement(userId, 'first_5k', { value: run.distance, runId: run._id });
        newAchievements.push(ACHIEVEMENTS.first_5k);
      }
    }

    if (run.distance >= 10 && run.distance < 10.5) {
      const existing = await Achievement.findOne({ userId, type: 'first_10k' });
      if (!existing) {
        await createAchievement(userId, 'first_10k', { value: run.distance, runId: run._id });
        newAchievements.push(ACHIEVEMENTS.first_10k);
      }
    }

    if (run.distance >= 21.0975 && run.distance < 22) {
      const existing = await Achievement.findOne({ userId, type: 'first_half_marathon' });
      if (!existing) {
        await createAchievement(userId, 'first_half_marathon', { value: run.distance, runId: run._id });
        newAchievements.push(ACHIEVEMENTS.first_half_marathon);
      }
    }

    if (run.distance >= 42.195 && run.distance < 43) {
      const existing = await Achievement.findOne({ userId, type: 'first_marathon' });
      if (!existing) {
        await createAchievement(userId, 'first_marathon', { value: run.distance, runId: run._id });
        newAchievements.push(ACHIEVEMENTS.first_marathon);
      }
    }

    // Streak achievements
    if (user.runStats.currentStreak === 7) {
      const existing = await Achievement.findOne({ userId, type: 'streak_7' });
      if (!existing) {
        await createAchievement(userId, 'streak_7', { value: 7 });
        newAchievements.push(ACHIEVEMENTS.streak_7);
      }
    }

    if (user.runStats.currentStreak === 30) {
      const existing = await Achievement.findOne({ userId, type: 'streak_30' });
      if (!existing) {
        await createAchievement(userId, 'streak_30', { value: 30 });
        newAchievements.push(ACHIEVEMENTS.streak_30);
      }
    }

    if (user.runStats.currentStreak === 100) {
      const existing = await Achievement.findOne({ userId, type: 'streak_100' });
      if (!existing) {
        await createAchievement(userId, 'streak_100', { value: 100 });
        newAchievements.push(ACHIEVEMENTS.streak_100);
      }
    }

    // Total distance achievements
    if (user.runStats.totalDistance >= 100 && user.runStats.totalDistance - run.distance < 100) {
      await createAchievement(userId, 'distance_100km', { value: user.runStats.totalDistance });
      newAchievements.push(ACHIEVEMENTS.distance_100km);
    }

    if (user.runStats.totalDistance >= 500 && user.runStats.totalDistance - run.distance < 500) {
      await createAchievement(userId, 'distance_500km', { value: user.runStats.totalDistance });
      newAchievements.push(ACHIEVEMENTS.distance_500km);
    }

    if (user.runStats.totalDistance >= 1000 && user.runStats.totalDistance - run.distance < 1000) {
      await createAchievement(userId, 'distance_1000km', { value: user.runStats.totalDistance });
      newAchievements.push(ACHIEVEMENTS.distance_1000km);
    }

    // Speed achievements
    if (run.distance >= 5 && run.duration <= 1500) { // 25 minutes
      const existing = await Achievement.findOne({ userId, type: 'fastest_5k' });
      if (!existing) {
        await createAchievement(userId, 'fastest_5k', { value: run.duration, runId: run._id });
        newAchievements.push(ACHIEVEMENTS.fastest_5k);
      }
    }

    if (run.distance >= 10 && run.duration <= 3000) { // 50 minutes
      const existing = await Achievement.findOne({ userId, type: 'fastest_10k' });
      if (!existing) {
        await createAchievement(userId, 'fastest_10k', { value: run.duration, runId: run._id });
        newAchievements.push(ACHIEVEMENTS.fastest_10k);
      }
    }

    // Time of day achievements
    const hour = new Date(run.date).getHours();
    if (hour < 6) {
      const existing = await Achievement.findOne({ userId, type: 'early_bird' });
      if (!existing) {
        await createAchievement(userId, 'early_bird', { runId: run._id });
        newAchievements.push(ACHIEVEMENTS.early_bird);
      }
    }

    if (hour >= 22) {
      const existing = await Achievement.findOne({ userId, type: 'night_owl' });
      if (!existing) {
        await createAchievement(userId, 'night_owl', { runId: run._id });
        newAchievements.push(ACHIEVEMENTS.night_owl);
      }
    }

  } catch (err) {
    console.error('Error checking achievements:', err);
  }

  return newAchievements;
};

async function createAchievement(userId, type, metadata) {
  try {
    await Achievement.create({ userId, type, metadata });
  } catch (err) {
    // Ignore duplicate key errors
    if (err.code !== 11000) {
      console.error('Error creating achievement:', err);
    }
  }
}

exports.getUserAchievements = async (userId) => {
  const achievements = await Achievement.find({ userId }).sort({ earnedAt: -1 });
  return achievements.map(a => ({
    ...ACHIEVEMENTS[a.type],
    type: a.type,
    earnedAt: a.earnedAt,
    metadata: a.metadata
  }));
};

exports.ACHIEVEMENTS = ACHIEVEMENTS;
