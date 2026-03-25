# Running Tracker Feature

## ✅ Complete Running Section Added

### New Pages

**1. Running Dashboard (`/running`)**
- View all runs history
- Stats cards: Total runs, Total KM, Avg pace, Longest run
- List of past runs with distance, time, pace
- Delete runs
- "Start Run" button

**2. Run Tracker (`/run-tracker`)**
- Live GPS tracking
- Real-time distance calculation
- Live timer
- Current pace display
- Start/Pause/Resume/Finish/Cancel controls
- GPS point counter
- Saves route coordinates

**3. Run Detail (`/run/:id`)**
- View individual run details
- Interactive map showing route
- Start/Finish markers
- Distance, duration, pace stats
- Notes (if added)

### Features

#### GPS Route Tracking
- Uses browser Geolocation API
- High accuracy mode enabled
- Records lat/lng coordinates with timestamps
- Calculates distance using Haversine formula
- Updates every few seconds

#### Real-Time Metrics
- **Distance:** Kilometers (2 decimal places)
- **Time:** HH:MM:SS format
- **Pace:** Minutes per kilometer (MM:SS)
- **Route:** Array of GPS coordinates

#### Interactive Map
- Powered by Leaflet + OpenStreetMap
- Blue polyline showing route
- Start marker (green)
- Finish marker (red)
- Zoom/pan controls
- Free, no API key needed

#### Statistics
- Total runs count
- Total distance (all time)
- Average pace
- Longest run distance

### How It Works

**Starting a Run:**
1. Click "🏃 Running" from Dashboard
2. Click "Start Run"
3. Browser requests GPS permission
4. Click "▶️ Start Run"
5. GPS tracking begins
6. Distance/time update in real-time

**During Run:**
- Large display shows current KM
- Timer counts up
- Pace calculated automatically
- Can pause/resume anytime
- GPS points recorded continuously

**Finishing Run:**
1. Click "⏹️ Finish"
2. Run saved to database
3. Redirects to Running dashboard
4. Can view route on map

**Viewing Run:**
1. Click "View" on any run
2. See stats and interactive map
3. Route displayed as blue line
4. Start/finish markers shown

### Technical Details

#### Backend
- **Model:** Run (userId, date, distance, duration, pace, route, notes)
- **Routes:** GET/POST/DELETE `/api/runs`, GET `/api/runs/stats`
- **Controller:** CRUD operations + statistics calculation

#### Frontend
- **GPS API:** `navigator.geolocation.watchPosition()`
- **Distance:** Haversine formula (accurate for Earth's curvature)
- **Map:** Leaflet + React-Leaflet + OpenStreetMap tiles
- **State:** React hooks for tracking state

#### Distance Calculation
```javascript
// Haversine formula
const R = 6371; // Earth's radius in km
const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lon2 - lon1) * Math.PI / 180;
const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * 
          Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
const distance = R * c; // in kilometers
```

### Browser Requirements

**GPS Access:**
- HTTPS required (or localhost for development)
- User must grant location permission
- GPS/Location services must be enabled on device
- Works on mobile and desktop (if GPS available)

**Best Experience:**
- Mobile phone with GPS
- Outdoor location (better GPS signal)
- Keep screen on during run
- Stable internet for map tiles

### Privacy & Permissions

- GPS permission requested on first use
- Location data only stored for your runs
- Route coordinates saved to your account
- Can delete runs anytime
- No location sharing with others

### Limitations

**Browser GPS:**
- Less accurate than dedicated GPS devices
- Requires internet for map tiles
- Battery drain on mobile
- May lose signal indoors/tunnels

**Accuracy:**
- Typically 5-10 meter accuracy
- Can vary based on device/conditions
- Distance calculated between GPS points
- More points = more accurate distance

### Future Enhancements

Possible additions:
- Elevation tracking
- Split times (per km)
- Audio cues (distance/pace announcements)
- Offline map support
- Export GPX files
- Share runs with friends
- Running challenges/goals
- Heart rate integration (if device supports)
- Weather conditions
- Photos during run

### Testing

**Desktop (Development):**
```bash
cd frontend
npm start
```
- Browser may simulate GPS or use WiFi location
- Less accurate than mobile GPS
- Good for testing UI/functionality

**Mobile (Best):**
1. Deploy to Vercel (HTTPS required)
2. Open on phone
3. Grant location permission
4. Go outside for GPS signal
5. Start tracking

**Troubleshooting:**

**GPS not working?**
- Check location permission in browser
- Enable GPS on device
- Go outside (better signal)
- Try different browser

**Distance seems wrong?**
- GPS accuracy varies
- Indoor tracking less accurate
- Wait for more GPS points
- Check device GPS settings

**Map not loading?**
- Check internet connection
- OpenStreetMap tiles require internet
- Map loads after run is saved

## API Endpoints

```
GET    /api/runs          - Get all user runs
GET    /api/runs/stats    - Get running statistics
GET    /api/runs/:id      - Get specific run
POST   /api/runs          - Create new run
DELETE /api/runs/:id      - Delete run
```

## Database Schema

```javascript
{
  userId: ObjectId,
  date: Date,
  distance: Number,      // kilometers
  duration: Number,      // seconds
  pace: Number,          // min/km
  route: [{
    lat: Number,
    lng: Number,
    timestamp: Number
  }],
  notes: String
}
```

## Dependencies Added

**Frontend:**
- `leaflet` - Map library
- `react-leaflet` - React wrapper for Leaflet

**Backend:**
- No new dependencies (uses existing Express/Mongoose)

## Mobile App Considerations

For better GPS tracking, consider building native app:
- React Native + Expo Location
- Capacitor + Geolocation plugin
- Background tracking
- Better battery optimization
- Offline map caching
- More accurate GPS

Current web version works but native is optimal for serious runners.
