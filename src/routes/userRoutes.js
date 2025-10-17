const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { logAuthAttempt } = require('../middleware/logger');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateUserId
} = require('../middleware/validation');

// Public routes with rate limiting, logging, and validation
router.post('/register', authLimiter, logAuthAttempt, validateUserRegistration, userController.register);
router.post('/login', authLimiter, logAuthAttempt, validateUserLogin, userController.login);

// Protected routes with validation
router.post('/logout', requireAuth, userController.logout);
router.get('/', requireAuth, userController.getAll);
router.get('/:id', requireAuth, validateUserId, userController.getById);
router.put('/:id', requireAuth, validateUserUpdate, userController.update);
router.delete('/:id', requireAuth, validateUserId, userController.delete);

module.exports = router;
