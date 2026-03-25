const express = require('express');
const authMiddleware = require('../middleware/auth');
const { 
  getRuns, 
  getRunById, 
  createRun, 
  deleteRun, 
  getRunStats,
  getSegmentLeaderboard,
  shareRun,
  getFriendsRuns,
  getHeatmapData
} = require('../controllers/runController');

const router = express.Router();

router.get('/', authMiddleware, getRuns);
router.get('/stats', authMiddleware, getRunStats);
router.get('/heatmap', authMiddleware, getHeatmapData);
router.get('/friends', authMiddleware, getFriendsRuns);
router.get('/segment/:routeName', authMiddleware, getSegmentLeaderboard);
router.get('/:id', authMiddleware, getRunById);
router.post('/', authMiddleware, createRun);
router.post('/:id/share', authMiddleware, shareRun);
router.delete('/:id', authMiddleware, deleteRun);

module.exports = router;
