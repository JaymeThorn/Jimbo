const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getStats } = require('../controllers/statsController');

const router = express.Router();

router.get('/', authMiddleware, getStats);

module.exports = router;
