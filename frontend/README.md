# Gym Tracker Frontend

React frontend for the Gym Tracker application.

## Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment:**
Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Run locally:**
```bash
npm start
```

App runs at `http://localhost:3000`

## Features

✅ User authentication (register/login)  
✅ JWT token stored in localStorage  
✅ Protected routes  
✅ Create workouts with multiple exercises  
✅ Add multiple sets per exercise  
✅ View workout history  
✅ View workout details  
✅ Delete workouts  

## Pages

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Workout list (protected)
- `/create-workout` - Create new workout (protected)
- `/workout/:id` - View workout details (protected)

## Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Build and deploy:
```bash
npm run build
vercel --prod
```

3. Set environment variable in Vercel dashboard:
   - `REACT_APP_API_URL` - Your backend API URL (e.g., `https://your-backend.onrender.com/api`)

### Alternative: Deploy via Vercel Dashboard

1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set environment variable: `REACT_APP_API_URL`
4. Deploy

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── PrivateRoute.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── CreateWorkout.js
│   │   └── WorkoutDetail.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── .env
└── package.json
```

## Running Full Stack Locally

1. Start backend:
```bash
cd backend
npm run dev
```

2. Start frontend (new terminal):
```bash
cd frontend
npm start
```

Backend: `http://localhost:5000`  
Frontend: `http://localhost:3000`
