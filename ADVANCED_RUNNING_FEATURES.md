# Advanced Running Features

## Overview
Your gym tracker now has a comprehensive running feature set with analytics, social features, and smart tracking capabilities.

## Features Implemented

### 📊 Analytics & Insights

#### Pace Zones
- Automatic classification of runs into zones: Recovery, Easy, Tempo, Threshold, Interval
- Based on your pace (min/km)
- Visual badges and color coding throughout the app

#### Weekly/Monthly Totals
- Track distance covered this week
- Track distance covered this month
- Compare against previous periods

#### Personal Records (PRs)
- Automatically extracts best times from any run:
  - Fastest 5K
  - Fastest 10K
  - Fastest Half Marathon (21.1km)
  - Fastest Marathon (42.2km)
  - Longest Run
- Shows date achieved and links to the run

#### Elevation Tracking
- Elevation gain/loss calculated from GPS data
- Visual elevation profile chart
- Shows total climb and descent

### 🔥 Social & Motivation

#### Run Streaks
- Current streak (consecutive days with runs)
- Longest streak ever achieved
- Visual streak counter with fire emoji

#### Monthly Challenges
- 100km monthly challenge
- Progress bar showing completion percentage
- Motivational tracking

#### Segment Leaderboards
- Name your routes (e.g., "Morning Loop", "Park Run")
- Compete with yourself and others on the same route
- Top 10 fastest times displayed
- Your position highlighted

#### Share Runs with Friends
- Toggle runs as public/private
- Friends can see your shared runs
- View friends' activity feed

### 🎯 Smart Features

#### Auto-Pause
- Automatically pauses when you stop moving
- Detects when speed drops below 0.5 km/h for 10 seconds
- Resume automatically when you start moving

#### Split Times
- Automatic 1km splits
- Shows time and pace for each kilometer
- Helps track pacing consistency

#### Predicted Finish Times
- Real-time predictions based on current pace:
  - 5K predicted time
  - 10K predicted time
  - Half Marathon predicted time
  - Full Marathon predicted time
- Updates as you run

#### Weather Logging
- Records weather conditions with each run (placeholder for API integration)
- Temperature, conditions, humidity
- Helps track performance in different conditions

#### Route Recommendations
- Finds similar routes you've run before
- Compares performance on same routes
- Shows if you were faster or slower

### 🎨 Visual Enhancements

#### Heatmap
- Combines all your routes into one visualization
- Shows all GPS points from every run
- Reveals your most-traveled areas

#### 3D Elevation Profile
- SVG-based elevation chart
- Shows climbs and descents
- Elevation gain/loss statistics

#### Pace Color-Coding on Map
- Route colored by speed:
  - Green = Fast (>12 km/h)
  - Yellow-Green = Good (10-12 km/h)
  - Yellow = Moderate (8-10 km/h)
  - Orange = Slow (6-8 km/h)
  - Red = Very slow (<6 km/h)
- Visual representation of effort

#### Comparison Overlay
- View similar routes side-by-side
- Compare times, paces, distances
- "Faster" badge for improved performance

## New Pages

### Running Dashboard (`/running`)
- Overview of all running stats
- Streak counter
- Monthly challenge progress
- Personal records display
- Pace zone distribution
- Recent runs
- Friends activity feed

### Enhanced Run Detail (`/run/:id`)
- Full run statistics
- Pace-colored route map
- Split times table
- Elevation profile
- Similar routes comparison
- Segment leaderboard (if route named)
- Weather conditions
- Share button

### Run Tracker (`/run-tracker`)
- Live GPS tracking
- Real-time stats (distance, time, pace, speed)
- Split times as you run
- Predicted finish times
- Auto-pause indicator
- Route naming

## Database Schema Updates

### Run Model
```javascript
{
  route: [{ lat, lng, timestamp, elevation, speed }],
  splits: [{ distance, time, pace }],
  elevationGain: Number,
  elevationLoss: Number,
  heartRate: { avg, max, zones },
  weather: { temp, condition, humidity },
  paceZone: String,
  routeName: String,
  isShared: Boolean
}
```

### User Model
```javascript
{
  runStats: {
    currentStreak: Number,
    longestStreak: Number,
    lastRunDate: Date,
    totalDistance: Number,
    totalRuns: Number,
    personalRecords: {
      fastest5k: { time, runId, date },
      fastest10k: { time, runId, date },
      fastestHalfMarathon: { time, runId, date },
      fastestMarathon: { time, runId, date },
      longestRun: { distance, runId, date }
    }
  },
  friends: [userId]
}
```

## API Endpoints

### New Endpoints
- `GET /api/runs/heatmap` - Get all GPS points for heatmap
- `GET /api/runs/friends` - Get shared runs from friends
- `GET /api/runs/segment/:routeName` - Get leaderboard for a route
- `POST /api/runs/:id/share` - Toggle run sharing

### Enhanced Endpoints
- `GET /api/runs/stats` - Now includes streaks, PRs, pace zones, weekly/monthly totals
- `GET /api/runs/:id` - Now includes similar routes
- `POST /api/runs` - Now calculates splits, elevation, pace zones automatically

## Backend Utilities

### `runAnalytics.js`
- `calculateSplits()` - Extract km splits from route
- `calculateElevation()` - Calculate gain/loss
- `determinePaceZone()` - Classify pace
- `extractBestEfforts()` - Find fastest 5k/10k/etc from any run
- `updateUserStats()` - Update streaks and PRs
- `predictFinishTime()` - Calculate predicted times
- `findSimilarRoutes()` - Match routes by start/end points

## UI Components

### New CSS Classes
- `.streak-card` - Gradient card for streak display
- `.challenge-card` - Gradient card for monthly challenge
- `.pr-card` - Personal record display
- `.pace-zone-bar` - Color-coded pace zone bars
- `.pace-badge` - Small pace zone indicators
- `.splits-display` - Split times table
- `.predictions` - Predicted finish times
- `.elevation-profile` - SVG elevation chart
- `.leaderboard` - Segment leaderboard
- `.similar-routes` - Route comparison grid

## Future Enhancements (Easy to Add)

1. **Weather API Integration**
   - Add OpenWeatherMap API key
   - Fetch real weather data during runs

2. **Heart Rate Monitoring**
   - Connect to fitness devices
   - Track HR zones
   - Calculate training load

3. **Training Plans**
   - Couch to 5K
   - Marathon training schedules
   - Suggested workouts

4. **Advanced Heatmap**
   - Interactive Leaflet heatmap layer
   - Intensity-based coloring
   - Filter by date range

5. **Social Features**
   - Friend requests
   - Comments on runs
   - Kudos/likes
   - Activity feed

6. **Route Builder**
   - Plan routes before running
   - Save favorite routes
   - Discover popular routes nearby

## Deployment

All features are backend-compatible and will work once deployed:

1. Push to GitHub ✅
2. Deploy backend to Render (auto-deploys from GitHub)
3. Deploy frontend to Vercel (auto-deploys from GitHub)
4. Test on mobile device

## Mobile Optimization

All features are mobile-friendly:
- GPS tracking works on phones
- Touch-friendly UI
- Responsive layouts
- Works offline (GPS tracking)
- Background tracking support

## Performance Notes

- GPS tracking uses high accuracy mode
- Route data compressed for storage
- Lazy loading for heatmap data
- Efficient queries with MongoDB indexes
- Client-side caching of stats

Enjoy your advanced running tracker! 🏃‍♂️💨
