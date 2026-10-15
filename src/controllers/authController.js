// controllers/authController.js — Authentication Business Logic
// Handles registration, login, and profile retrieval using Mongoose models.
// Replaces the file-based user lookups from Part 1 with MongoDB queries.
//
// We used the jsonwebtoken package for creating JWTs:
// https://www.npmjs.com/package/jsonwebtoken
// and followed the OWASP Authentication Cheat Sheet for secure patterns:
// https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
// Mongoose query docs: https://mongoosejs.com/docs/queries.html

const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');
const { recordFailedAttempt, clearFailedAttempts } = require('../middleware/securityFeatures');

// POST /api/auth/register
// Checks for duplicate emails, hashes the password (handled by User model
// pre-save hook), and returns the new user without exposing the password hash.
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if a user with this email already exists in MongoDB
    // Ref: https://mongoosejs.com/docs/api/model.html#Model.findOne()
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 409, 'A user with this email already exists.');
    }

    // Create the user — password gets hashed in the pre-save hook
    // Ref: https://mongoosejs.com/docs/api/model.html#Model.prototype.save()
    const user = await User.create({ name, email, password, role });

    logger.info(`New user registered: ${user.email} (role: ${user.role})`);

    return sendSuccess(res, 201, 'User registered successfully.', { user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
// Returns a generic "Invalid email or password" for both wrong email and wrong
// password. OWASP says this prevents user enumeration attacks:
// https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // We need to explicitly select the password field since toJSON strips it
    // Ref: https://mongoosejs.com/docs/api/query.html#Query.prototype.select()
    const ip = req.ip || req.connection.remoteAddress;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      recordFailedAttempt(ip);
      logger.warn(`Failed login attempt for non-existent email from IP ${ip}`);
      return sendError(res, 401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      recordFailedAttempt(ip);
      logger.warn(`Failed login attempt for ${user.email} from IP ${ip}`);
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(ip);

    // JWT payload has the user's id, email, and role for stateless auth.
    // Signed with HS256 by default — see RFC 7519, Section 8.
    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    logger.info(`User logged in: ${user.email}`);

    return sendSuccess(res, 200, 'Login successful.', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile
// Requires a valid JWT (checked by the authenticate middleware).
const getProfile = async (req, res, next) => {
  try {
    // Fetch the latest user data from MongoDB
    // Ref: https://mongoosejs.com/docs/api/model.html#Model.findById()
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    return sendSuccess(res, 200, 'Profile retrieved successfully.', {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile };
