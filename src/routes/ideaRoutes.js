const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { requireAuth } = require('../middleware/auth');
const {
  validateIdeaCreation,
  validateIdeaUpdate,
  validateIdeaId
} = require('../middleware/validation');

// All idea routes require authentication and validation
router.post('/', requireAuth, validateIdeaCreation, ideaController.create);
router.get('/', requireAuth, ideaController.getAll);
router.get('/:id', requireAuth, validateIdeaId, ideaController.getById);
router.put('/:id', requireAuth, validateIdeaUpdate, ideaController.update);
router.delete('/:id', requireAuth, validateIdeaId, ideaController.delete);

module.exports = router;
