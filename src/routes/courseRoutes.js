const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, courseController.create);
router.get('/', requireAuth, courseController.getAll);
router.get('/:id', requireAuth, courseController.getById);
router.put('/:id', requireAuth, courseController.update);
router.delete('/:id', requireAuth, courseController.delete);

module.exports = router;
