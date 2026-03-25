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
  getHeatmapData,
  addKudos,
  addComment,
  getActivityFeed,
  getUserAchievements,
  followUser,
  searchUsers
} = require('../controllers/runController');

const router = express.Router();

router.get('/', authMiddleware, getRuns);
router.get('/stats', authMiddleware, getRunStats);
router.get('/heatmap', authMiddleware, getHeatmapData);
router.get('/friends', authMiddleware, getFriendsRuns);
router.get('/feed', authMiddleware, getActivityFeed);
router.get('/achievements', authMiddleware, getUserAchievements);
router.get('/segment/:routeName', authMiddleware, getSegmentLeaderboard);
router.get('/search-users', authMiddleware, searchUsers);
router.get('/:id', authMiddleware, getRunById);
router.post('/', authMiddleware, createRun);
router.post('/:id/share', authMiddleware, shareRun);
router.post('/:id/kudos', authMiddleware, addKudos);
router.post('/:id/comment', authMiddleware, addComment);
router.post('/follow', authMiddleware, followUser);
router.delete('/:id', authMiddleware, deleteRun);

module.exports = router;
