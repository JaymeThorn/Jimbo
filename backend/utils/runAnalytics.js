// Calculate splits from route data
exports.calculateSplits = (route, totalDistance) => {
  if (!route || route.length < 2) return [];
  
  const splits = [];
  let currentDistance = 0;
  let splitStart = 0;
  let splitDistance = 1; // 1km splits
  
  for (let i = 1; i < route.length; i++) {
    const segmentDist = calculateDistance(
      route[i-1].lat, route[i-1].lng,
      route[i].lat, route[i].lng
    );
    currentDistance += segmentDist;
    
    if (currentDistance >= splitDistance) {
      const splitTime = (route[i].timestamp - route[splitStart].timestamp) / 1000;
      splits.push({
        distance: splitDistance,
        time: splitTime,
        pace: splitTime / 60 / splitDistance
      });
      splitStart = i;
      splitDistance++;
    }
  }
  
  return splits;
};

// Calculate elevation gain/loss
exports.calculateElevation = (route) => {
  if (!route || route.length < 2) return { gain: 0, loss: 0 };
  
  let gain = 0;
  let loss = 0;
  
  for (let i = 1; i < route.length; i++) {
    const diff = (route[i].elevation || 0) - (route[i-1].elevation || 0);
    if (diff > 0) gain += diff;
    else loss += Math.abs(diff);
  }
  
  return { gain, loss };
};

// Determine pace zone
exports.determinePaceZone = (pace) => {
  // Based on typical running zones (min/km)
  if (pace > 7) return 'recovery';
  if (pace > 6) return 'easy';
  if (pace > 5) return 'tempo';
  if (pace > 4) return 'threshold';
  return 'interval';
};

// Extract best efforts (5k, 10k, etc)
exports.extractBestEfforts = (route, totalDistance) => {
  const efforts = {};
  const distances = [5, 10, 21.0975, 42.195]; // 5k, 10k, half, full
  
  if (!route || route.length < 2) return efforts;
  
  distances.forEach(targetDist => {
    if (totalDistance >= targetDist) {
      let bestTime = Infinity;
      
      // Sliding window to find fastest segment
      for (let start = 0; start < route.length; start++) {
        let distance = 0;
        for (let end = start + 1; end < route.length; end++) {
          distance += calculateDistance(
            route[end-1].lat, route[end-1].lng,
            route[end].lat, route[end].lng
          );
          
          if (distance >= targetDist) {
            const time = (route[end].timestamp - route[start].timestamp) / 1000;
            if (time < bestTime) bestTime = time;
            break;
          }
        }
      }
      
      if (bestTime !== Infinity) {
        efforts[`${targetDist}k`] = bestTime;
      }
    }
  });
  
  return efforts;
};

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

// Update user stats after a run
exports.updateUserStats = async (User, userId, run) => {
  const user = await User.findById(userId);
  if (!user) return;
  
  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastRun = user.runStats?.lastRunDate ? new Date(user.runStats.lastRunDate) : null;
  
  if (lastRun) {
    lastRun.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastRun) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      user.runStats.currentStreak = (user.runStats.currentStreak || 0) + 1;
    } else if (daysDiff > 1) {
      user.runStats.currentStreak = 1;
    }
  } else {
    user.runStats = user.runStats || {};
    user.runStats.currentStreak = 1;
  }
  
  user.runStats.longestStreak = Math.max(
    user.runStats.longestStreak || 0,
    user.runStats.currentStreak
  );
  user.runStats.lastRunDate = run.date;
  user.runStats.totalDistance = (user.runStats.totalDistance || 0) + run.distance;
  user.runStats.totalRuns = (user.runStats.totalRuns || 0) + 1;
  
  // Check for PRs
  const efforts = exports.extractBestEfforts(run.route, run.distance);
  user.runStats.personalRecords = user.runStats.personalRecords || {};
  
  if (efforts['5k'] && (!user.runStats.personalRecords.fastest5k?.time || efforts['5k'] < user.runStats.personalRecords.fastest5k.time)) {
    user.runStats.personalRecords.fastest5k = {
      time: efforts['5k'],
      runId: run._id,
      date: run.date
    };
  }
  
  if (efforts['10k'] && (!user.runStats.personalRecords.fastest10k?.time || efforts['10k'] < user.runStats.personalRecords.fastest10k.time)) {
    user.runStats.personalRecords.fastest10k = {
      time: efforts['10k'],
      runId: run._id,
      date: run.date
    };
  }
  
  if (efforts['21.0975k'] && (!user.runStats.personalRecords.fastestHalfMarathon?.time || efforts['21.0975k'] < user.runStats.personalRecords.fastestHalfMarathon.time)) {
    user.runStats.personalRecords.fastestHalfMarathon = {
      time: efforts['21.0975k'],
      runId: run._id,
      date: run.date
    };
  }
  
  if (efforts['42.195k'] && (!user.runStats.personalRecords.fastestMarathon?.time || efforts['42.195k'] < user.runStats.personalRecords.fastestMarathon.time)) {
    user.runStats.personalRecords.fastestMarathon = {
      time: efforts['42.195k'],
      runId: run._id,
      date: run.date
    };
  }
  
  if (!user.runStats.personalRecords.longestRun?.distance || run.distance > user.runStats.personalRecords.longestRun.distance) {
    user.runStats.personalRecords.longestRun = {
      distance: run.distance,
      runId: run._id,
      date: run.date
    };
  }
  
  await user.save();
};

// Get weather data (placeholder - would need API key)
exports.getWeather = async (lat, lng) => {
  // TODO: Integrate with OpenWeatherMap or similar
  return {
    temp: null,
    condition: null,
    humidity: null
  };
};

// Predict finish time based on current pace
exports.predictFinishTime = (currentDistance, currentTime, targetDistance) => {
  const currentPace = currentTime / currentDistance;
  return currentPace * targetDistance;
};

// Find similar routes
exports.findSimilarRoutes = (route, allRoutes, threshold = 0.5) => {
  // Simple implementation - compare start/end points
  const similar = [];
  
  if (!route || route.length < 2) return similar;
  
  const start = route[0];
  const end = route[route.length - 1];
  
  allRoutes.forEach(otherRoute => {
    if (!otherRoute.route || otherRoute.route.length < 2) return;
    
    const otherStart = otherRoute.route[0];
    const otherEnd = otherRoute.route[otherRoute.route.length - 1];
    
    const startDist = calculateDistance(start.lat, start.lng, otherStart.lat, otherStart.lng);
    const endDist = calculateDistance(end.lat, end.lng, otherEnd.lat, otherEnd.lng);
    
    if (startDist < threshold && endDist < threshold) {
      similar.push(otherRoute);
    }
  });
  
  return similar;
};
