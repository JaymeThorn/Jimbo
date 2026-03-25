# Gym Tracker

Full-stack workout tracking application with React frontend and Node.js backend.

## Tech Stack

- **Frontend:** React, React Router, Axios, Chart.js
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT with bcrypt password hashing

## Features

### Core Features
✅ User registration and login  
✅ JWT-based authentication  
✅ Create workouts with multiple exercises  
✅ Track sets (reps + weight) for each exercise  
✅ View workout history  
✅ Delete workouts  
✅ Protected routes  

### New Features
🔥 **Streak Tracker** - Track consecutive workout days  
🏆 **Personal Records (PRs)** - Automatic PR detection per exercise  
📈 **Progress Charts** - Visual weight progression over time  
📚 **Exercise Library** - 40+ common exercises with autocomplete  
💾 **Workout Templates** - Save and reuse favorite routines  
🍎 **Apple Health Integration** - Sync workouts (iOS app required)  
🏃 **Google Fit Integration** - Web-based workout sync  

## Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Backend runs at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Workouts (Protected)
- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/:id` - Get workout by ID
- `POST /api/workouts` - Create workout
- `DELETE /api/workouts/:id` - Delete workout

### Templates (Protected)
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create template
- `DELETE /api/templates/:id` - Delete template

### Stats (Protected)
- `GET /api/stats` - Get streak, PRs, and progress data

## Health App Integration

### Google Fit (Web)

**Syncs both gym workouts AND running data!**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project and enable "Fitness API"
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized JavaScript origins:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.vercel.app`
5. Add to `frontend/.env`: `REACT_APP_GOOGLE_CLIENT_ID=your_client_id`
6. Restart frontend

**What Gets Synced:**
- ✅ Running sessions (distance, duration, pace)
- ✅ GPS route data (full path)
- ✅ Gym workout sessions (strength training)
- ✅ Exercise types and duration

**How to Sync:**
1. Go to Health Sync page
2. Click "Connect Google Fit"
3. Authorize in popup
4. Click "Sync All Runs" to sync running data
5. Individual runs can be synced one at a time

**Required Scopes:**
- `fitness.activity.write` - Workout sessions
- `fitness.location.write` - GPS route data

### Apple Health (iOS)
Requires native iOS app with HealthKit. Web browsers cannot access Apple Health for privacy reasons. Consider:
- React Native + HealthKit
- Capacitor + Health plugin
- Swift native app

### ExerciseDB API (Optional - Exercise Images)
Get animated GIF demonstrations for 1300+ exercises:

1. Sign up at [RapidAPI ExerciseDB](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
2. Subscribe to **Basic Plan (FREE)** - 100 requests/day
3. Copy your API key
4. Add to `frontend/.env`: `REACT_APP_EXERCISEDB_KEY=your_api_key`
5. Restart frontend

**Automatic Fallback:** If API key is missing or rate limit exceeded, app automatically uses emoji icons. No errors, works perfectly!

See `EXERCISEDB_SETUP.md` for detailed instructions.

## Deployment

### Backend (Render)
1. Create account at [render.com](https://render.com)
2. Create Web Service from GitHub repo
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Frontend (Vercel)
1. Create account at [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set environment variables:
   - `REACT_APP_API_URL=https://your-backend-url.com/api`
   - `REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id` (optional)

## Project Structure

```
gym-tracker/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── workoutController.js
│   │   ├── templateController.js
│   │   └── statsController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Workout.js
│   │   └── WorkoutTemplate.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── workouts.js
│   │   ├── templates.js
│   │   └── stats.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   └── PrivateRoute.js
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   ├── CreateWorkout.js
        │   ├── WorkoutDetail.js
        │   ├── Templates.js
        │   ├── Progress.js
        │   └── HealthSync.js
        ├── services/
        │   └── api.js
        ├── utils/
        │   └── exercises.js
        └── App.js
```

## Screenshots

### Dashboard
- Streak counter with fire emoji
- Total workouts count
- Personal records count
- Workout history list

### Progress Page
- Personal records grid with gradient cards
- Interactive line charts
- Exercise selector dropdown

### Create Workout
- Exercise autocomplete from 40+ exercises
- Dynamic set management
- Save as template option

## License

MIT
