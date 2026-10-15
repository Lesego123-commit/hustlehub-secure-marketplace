// config/index.js — Centralised Configuration
// Loads env vars from .env using dotenv so we never hardcode secrets.
//
// dotenv docs: https://www.npmjs.com/package/dotenv
// OWASP recommends keeping secrets out of source code:
// https://owasp.org/www-project-web-security-testing-guide/
// Mongoose connection string format:
// https://www.mongodb.com/docs/manual/reference/connection-string/

const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the project root
// Ref: https://www.npmjs.com/package/dotenv#config
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  // JWT secret must be a strong random value, stored only in .env
  // Ref: RFC 7519, Section 10.1 — https://datatracker.ietf.org/doc/html/rfc7519#section-10.1
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  nodeEnv: process.env.NODE_ENV || 'development',
  // MongoDB connection URI — defaults to local instance
  // Ref: https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/hustlehub',
  certsDir: path.join(__dirname, '..', '..', 'certs'),
};

module.exports = config;
