const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.post('/logout', requireAuth, userController.logout);
router.get('/', requireAuth, userController.getAll);
router.get('/:id', requireAuth, userController.getById);
router.put('/:id', requireAuth, userController.update);
router.delete('/:id', requireAuth, userController.delete);

module.exports = router;
