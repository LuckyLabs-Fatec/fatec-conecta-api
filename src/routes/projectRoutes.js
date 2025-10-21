const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, projectController.create);
router.get('/', requireAuth, projectController.getAll);
router.get('/:id', requireAuth, projectController.getById);
router.put('/:id', requireAuth, projectController.update);
router.delete('/:id', requireAuth, projectController.delete);

module.exports = router;
