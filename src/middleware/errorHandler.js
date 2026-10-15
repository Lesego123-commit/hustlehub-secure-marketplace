// middleware/errorHandler.js — Global Error Handler
// Catches all unhandled errors and sends back safe JSON responses.
// We never leak stack traces or file paths to the client.
// Now includes handling for Mongoose-specific errors (validation, duplicate keys).
//
// Express error handling docs: https://expressjs.com/en/guide/error-handling.html
// OWASP Error Handling Cheat Sheet:
// https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
// Mongoose error handling: https://mongoosejs.com/docs/api/error.html
// MongoDB duplicate key errors: https://www.mongodb.com/docs/manual/core/write-operations-atomicity/

const logger = require('../utils/logger');

// Express requires exactly 4 params (err, req, res, next) to recognise
// this as an error-handling middleware.
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging — always log to file, console shows in dev
  logger.error(`${err.name || 'Error'}: ${err.message}`);

  let statusCode = err.statusCode || 500;
  let message = 'An unexpected error occurred. Please try again later.';

  // Mongoose validation error — happens when schema validators reject input.
  // Each field that failed validation has its own message.
  // Ref: https://mongoosejs.com/docs/validation.html#validation-errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }

  // MongoDB duplicate key error (code 11000) — e.g. trying to register
  // with an email that already exists.
  // Ref: https://www.mongodb.com/docs/manual/reference/error-codes/
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists.`;
  }

  // Mongoose CastError — happens when an invalid ObjectId is passed.
  // e.g. GET /api/gigs/not-a-valid-id
  // Ref: https://mongoosejs.com/docs/api/error.html#Error.CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // For 500 errors we send a generic message so we don't accidentally
  // expose internal details like DB connection strings or file paths.
  // Ref: OWASP — "Applications should not expose internal error messages to users"
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
