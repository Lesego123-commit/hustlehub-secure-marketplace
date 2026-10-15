// utils/logger.js — Winston Logging Configuration
// Centralised logging for the HustleHub+ API. Logs to console and to file
// so we can debug issues in development and audit in production.
//
// Winston docs: https://www.npmjs.com/package/winston
// Winston transport reference: https://github.com/winstonjs/winston#transports
// OWASP Logging Cheat Sheet (what to log and what NOT to log):
// https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
// Node.js best practices for logging:
// https://nodejs.org/en/learn/getting-started/debugging

const winston = require('winston');
const path = require('path');

// Log format: [2026-09-25 14:30:00] INFO: Server started on port 5000
// Ref: https://github.com/winstonjs/winston#formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Create the logger with console + file transports.
// Console transport shows logs during development.
// File transport writes to logs/app.log for persistent records.
// Ref: https://github.com/winstonjs/winston#creating-your-own-logger
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // Console output for dev visibility
    new winston.transports.Console(),
    // File output for audit trail and debugging production issues
    // Ref: https://github.com/winstonjs/winston/blob/master/docs/transports.md#file-transport
    new winston.transports.File({
      filename: path.join(__dirname, '..', '..', 'logs', 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

module.exports = logger;
