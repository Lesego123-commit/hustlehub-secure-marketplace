// routes/authRoutes.js — Authentication API Routes
// Defines the register, login, and profile endpoints with input validation
// and rate limiting to prevent brute force attacks.
//
// Express routing: https://expressjs.com/en/guide/routing.html
// express-validator validation chains: https://express-validator.github.io/docs/api/validation-chain/
// OWASP Input Validation: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
// NIST SP 800-63B password guidelines: https://pages.nist.gov/800-63-3/sp800-63b.html

const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { loginAttemptTracker } = require('../middleware/securityFeatures');

const router = express.Router();

// Validation rules for registration.
// Password complexity follows OWASP recommendations:
// https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#password-complexity
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name may only contain letters, spaces, hyphens, and apostrophes'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    // normalizeEmail converts to lowercase and cleans up the format
    // Ref: https://express-validator.github.io/docs/api/sanitizers/#normalizeemail
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  body('role')
    .optional()
    .trim()
    .isIn(['client', 'freelancer', 'admin']).withMessage('Role must be client, freelancer, or admin'),
];

// Login just needs email + password, no complexity checks here
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register — rate limited + validated
router.post('/register', authLimiter, registerValidation, validate, register);

// POST /api/auth/login — rate limited + lockout checked + validated
router.post('/login', authLimiter, loginAttemptTracker, loginValidation, validate, login);

// GET /api/auth/profile — needs a valid JWT
router.get('/profile', authenticate, getProfile);

module.exports = router;
