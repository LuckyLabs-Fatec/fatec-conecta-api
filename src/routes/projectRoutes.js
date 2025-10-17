const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { requireAuth } = require('../middleware/auth');
const {
  validateProjectCreation,
  validateProjectUpdate,
  validateProjectId
} = require('../middleware/validation');

// All project routes require authentication and validation
router.post('/', requireAuth, validateProjectCreation, projectController.create);
router.get('/', requireAuth, projectController.getAll);
router.get('/:id', requireAuth, validateProjectId, projectController.getById);
router.put('/:id', requireAuth, validateProjectUpdate, projectController.update);
router.delete('/:id', requireAuth, validateProjectId, projectController.delete);

module.exports = router;
