const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getRuns, getRunById, createRun, deleteRun, getRunStats } = require('../controllers/runController');

const router = express.Router();

router.get('/', authMiddleware, getRuns);
router.get('/stats', authMiddleware, getRunStats);
router.get('/:id', authMiddleware, getRunById);
router.post('/', authMiddleware, createRun);
router.delete('/:id', authMiddleware, deleteRun);

module.exports = router;
