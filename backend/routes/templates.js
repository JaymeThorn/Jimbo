const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getTemplates, createTemplate, deleteTemplate } = require('../controllers/templateController');

const router = express.Router();

router.get('/', authMiddleware, getTemplates);
router.post('/', authMiddleware, createTemplate);
router.delete('/:id', authMiddleware, deleteTemplate);

module.exports = router;
