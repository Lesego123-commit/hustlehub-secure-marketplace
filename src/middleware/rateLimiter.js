// middleware/rateLimiter.js — Rate Limiting Middleware
// Creates separate rate limiters for different parts of the API to prevent
// brute force attacks and resource exhaustion.
//
// express-rate-limit docs: https://www.npmjs.com/package/express-rate-limit
// OWASP Brute Force Prevention Cheat Sheet:
// https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html
// OWASP Blocking Brute Force Attacks:
// https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks
// IETF RFC 6585 (429 Too Many Requests):
// https://datatracker.ietf.org/doc/html/rfc6585#section-4

const rateLimit = require('express-rate-limit');

// Auth routes (register/login) — strict limit to prevent credential stuffing.
// 10 requests per 15-minute window per IP address.
// Ref: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Booking creation — moderate limit to prevent spam bookings.
// 20 requests per 15-minute window per IP address.
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many booking requests. Please try again after 15 minutes.',
  },
});

// General API routes — broader limit for normal browsing activity.
// 100 requests per 15-minute window per IP address.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
});

module.exports = { authLimiter, bookingLimiter, generalLimiter };
