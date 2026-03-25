# Gym Tracker Backend

Minimal Node.js + Express + MongoDB backend with JWT authentication.

## Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string
- `PORT` - Server port (default: 5000)

3. **Run locally:**
```bash
npm run dev
```

Server runs at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  { "email": "user@example.com", "password": "password123" }
  ```

- `POST /api/auth/login` - Login user
  ```json
  { "email": "user@example.com", "password": "password123" }
  ```

### Workouts (Protected - requires JWT token)
- `GET /api/workouts` - Get all user workouts
- `GET /api/workouts/:id` - Get specific workout
- `POST /api/workouts` - Create workout
  ```json
  {
    "date": "2024-03-25",
    "exercises": [
      {
        "name": "Bench Press",
        "sets": [
          { "reps": 10, "weight": 135 },
          { "reps": 8, "weight": 155 }
        ]
      }
    ]
  }
  ```
- `DELETE /api/workouts/:id` - Delete workout

### Authentication Header
Include JWT token in requests:
```
Authorization: Bearer <your_jwt_token>
```

## Deployment (Render)

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `MONGODB_URI` - MongoDB Atlas connection string
     - `JWT_SECRET` - Secure random string
     - `NODE_ENV` - `production`

## MongoDB Setup

**Local:** Install MongoDB or use Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Production:** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

## Project Structure
```
backend/
├── controllers/
│   ├── authController.js
│   └── workoutController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   └── Workout.js
├── routes/
│   ├── auth.js
│   └── workouts.js
├── .env.example
├── .gitignore
├── package.json
└── server.js
```
