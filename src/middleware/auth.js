// middleware/auth.js — JWT Authentication and Role-Based Access Control
// Protects routes by verifying Bearer tokens and checking user roles.
//
// Based on the jsonwebtoken docs: https://www.npmjs.com/package/jsonwebtoken
// JWT standard: RFC 7519 — https://datatracker.ietf.org/doc/html/rfc7519
// Bearer token format: RFC 6750 — https://datatracker.ietf.org/doc/html/rfc6750
// Express middleware guide: https://expressjs.com/en/guide/using-middleware.html

const jwt = require('jsonwebtoken');
const config = require('../config');
const { sendError } = require('../utils/response');

// Checks the Authorization header for a valid "Bearer <token>".
// If valid, attaches the decoded payload (id, email, role) to req.user
// so downstream handlers can use it.
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  // Split "Bearer <token>" to get just the token part
  // Ref: RFC 6750, Section 2.1
  const token = authHeader.split(' ')[1];

  try {
    // jwt.verify checks signature + expiration in one step
    // Ref: https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid token.');
  }
};

// RBAC middleware — restricts access to users with the right role.
// Usage: authorize('admin', 'freelancer') — only those roles get through.
// Ref: OWASP Access Control Cheat Sheet
// https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'Access denied. Insufficient permissions.');
    }
    next();
  };
};

module.exports = { authenticate, authorize };
