const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { requireAuth } = require('../middleware/auth');

// All idea routes require authentication
router.post('/', requireAuth, ideaController.create);
router.get('/', requireAuth, ideaController.getAll);
router.get('/:id', requireAuth, ideaController.getById);
router.put('/:id', requireAuth, ideaController.update);
router.delete('/:id', requireAuth, ideaController.delete);

module.exports = router;
