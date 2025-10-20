const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, feedbackController.create);
router.get('/', requireAuth, feedbackController.getAll);
router.get('/:id', requireAuth, feedbackController.getById);
router.put('/:id', requireAuth, feedbackController.update);
router.delete('/:id', requireAuth, feedbackController.delete);

module.exports = router;
