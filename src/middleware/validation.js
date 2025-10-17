const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores and hyphens'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['Student', 'Community', 'Staff-Admin', 'Staff-Supervisor']).withMessage('Invalid role'),
  handleValidationErrors
];

const validateUserLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid user ID'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores and hyphens'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['Student', 'Community', 'Staff-Admin', 'Staff-Supervisor']).withMessage('Invalid role'),
  handleValidationErrors
];

const validateUserId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid user ID'),
  handleValidationErrors
];

// Idea validation rules
const validateIdeaCreation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  handleValidationErrors
];

const validateIdeaUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid idea ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  handleValidationErrors
];

const validateIdeaId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid idea ID'),
  handleValidationErrors
];

// Project validation rules
const validateProjectCreation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('ideaId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid idea ID'),
  handleValidationErrors
];

const validateProjectUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  handleValidationErrors
];

const validateProjectId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateUserId,
  validateIdeaCreation,
  validateIdeaUpdate,
  validateIdeaId,
  validateProjectCreation,
  validateProjectUpdate,
  validateProjectId
};
