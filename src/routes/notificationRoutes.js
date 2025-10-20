const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, notificationController.create);
router.get('/', requireAuth, notificationController.getAll);
router.get('/:id', requireAuth, notificationController.getById);
router.put('/:id', requireAuth, notificationController.update);
router.delete('/:id', requireAuth, notificationController.delete);

module.exports = router;
