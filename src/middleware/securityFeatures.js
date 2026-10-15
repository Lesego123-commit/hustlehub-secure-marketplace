// middleware/securityFeatures.js — Additional Security Features
// Implements two supplementary security mechanisms beyond the baseline
// protections already in place: request ID tracking and account lockout.
//
// Request ID Tracking:
//   Generates a unique identifier for every incoming HTTP request and attaches
//   it to the response headers as X-Request-ID. This enables distributed
//   tracing and log correlation across services.
//   Ref: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
//   Ref: https://www.rfc-editor.org/rfc/rfc7231#section-5.3
//
// Account Lockout:
//   Temporarily blocks login attempts from an IP address after 5 consecutive
//   failures within a 15-minute window. Prevents brute-force and credential
//   stuffing attacks.
//   Ref: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-lockout
//   Ref: https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks
//   Ref: https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html
//
// Node.js crypto module: https://nodejs.org/api/crypto.html

const crypto = require('crypto');
const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// Feature 1: Request ID Tracking
// ---------------------------------------------------------------------------
// Assigns a UUID-style request ID to every incoming request so that each
// request can be traced through application logs and across services.
// The ID is placed in the X-Request-ID response header for the client and
// stored on req.requestId for server-side logging.
// Ref: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

const requestIdMiddleware = (req, res, next) => {
  // Use the client-provided X-Request-ID if present (for upstream tracing),
  // otherwise generate a new one using crypto.randomUUID().
  // Ref: https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();

  // Attach to the request object for downstream middleware and controllers
  req.requestId = requestId;

  // Set the response header so the client can correlate its request
  res.setHeader('X-Request-ID', requestId);

  next();
};

// ---------------------------------------------------------------------------
// Feature 2: Account Lockout (IP-based)
// ---------------------------------------------------------------------------
// Tracks consecutive failed login attempts per IP address. After 5 failures
// within a 15-minute window, subsequent login attempts from that IP are
// blocked for 15 minutes. This mitigates brute-force and credential stuffing
// attacks without requiring persistent storage.
//
// Implementation uses an in-memory Map for simplicity. In a multi-instance
// deployment, a shared store such as Redis would be required.
//
// Ref: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-lockout
// Ref: https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks
// Ref: https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

// In-memory store: { ip: { attempts: Number, firstAttempt: Date, lockedUntil: Date|null } }
const loginAttempts = new Map();

/**
 * Periodically clean up expired entries to prevent memory leaks.
 * Runs every 30 minutes and removes entries whose lockout or tracking
 * window has expired.
 * Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts.entries()) {
    // Remove if the lockout has expired or the tracking window has passed
    if (record.lockedUntil && now > record.lockedUntil) {
      loginAttempts.delete(ip);
    } else if (now - record.firstAttempt > LOCKOUT_DURATION_MS) {
      loginAttempts.delete(ip);
    }
  }
}, 30 * 60 * 1000);

/**
 * Middleware that checks whether the requesting IP is currently locked out.
 * If so, responds with 429 Too Many Requests. Otherwise, allows the request
 * to proceed.
 */
const loginAttemptTracker = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const record = loginAttempts.get(ip);

  if (record && record.lockedUntil) {
    const now = Date.now();

    if (now < record.lockedUntil) {
      // IP is still locked out
      const remainingMs = record.lockedUntil - now;
      const remainingMinutes = Math.ceil(remainingMs / 60000);

      logger.warn(`Account lockout: login blocked for IP ${ip}. Locked for ${remainingMinutes} more minute(s).`);

      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      });
    }

    // Lockout expired — reset the record
    loginAttempts.delete(ip);
  }

  next();
};

/**
 * Records a failed login attempt for the given IP.
 * Called by the auth controller when login credentials are invalid.
 * Ref: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-lockout
 *
 * @param {string} ip - The IP address of the failed login request
 */
const recordFailedAttempt = (ip) => {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { attempts: 0, firstAttempt: now, lockedUntil: null };

  // Reset if the tracking window has expired
  if (now - record.firstAttempt > LOCKOUT_DURATION_MS) {
    record.attempts = 0;
    record.firstAttempt = now;
    record.lockedUntil = null;
  }

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    logger.warn(`Account lockout triggered for IP ${ip} after ${record.attempts} failed attempts.`);
  }

  loginAttempts.set(ip, record);
};

/**
 * Clears the failed attempt counter for the given IP upon successful login.
 * Ref: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 *
 * @param {string} ip - The IP address of the successful login request
 */
const clearFailedAttempts = (ip) => {
  loginAttempts.delete(ip);
};

module.exports = {
  requestIdMiddleware,
  loginAttemptTracker,
  recordFailedAttempt,
  clearFailedAttempts,
};
