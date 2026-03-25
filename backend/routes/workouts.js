const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getWorkouts, getWorkoutById, createWorkout, deleteWorkout } = require('../controllers/workoutController');

const router = express.Router();

router.get('/', authMiddleware, getWorkouts);
router.get('/:id', authMiddleware, getWorkoutById);
router.post('/', authMiddleware, createWorkout);
router.delete('/:id', authMiddleware, deleteWorkout);

module.exports = router;
