// app.js — Express Application Setup
// Wires up all the middleware (security headers, CORS, body parsing, sanitisation,
// rate limiting, HTTP logging), mounts the API routes, and adds error handling.
//
// Express docs: https://expressjs.com/en/5x/api.html
// Helmet (security headers): https://helmetjs.github.io/
// CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
// Morgan HTTP logger: https://www.npmjs.com/package/morgan
// express-mongo-sanitize: https://www.npmjs.com/package/express-mongo-sanitize
// express-rate-limit: https://www.npmjs.com/package/express-rate-limit
// OWASP REST Security Cheat Sheet:
// https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
// OWASP Secure Headers Project: https://owasp.org/www-project-secure-headers/

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const sanitise = require('./middleware/sanitise');
const { generalLimiter } = require('./middleware/rateLimiter');
const { requestIdMiddleware } = require('./middleware/securityFeatures');
const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const errorHandler = require('./middleware/errorHandler');
const { sendError } = require('./utils/response');
const logger = require('./utils/logger');

const app = express();

// Request ID tracking — assigns a unique identifier to every incoming request
// for distributed tracing and log correlation across services.
// Ref: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
app.use(requestIdMiddleware);

// Helmet adds security headers like X-Content-Type-Options, X-Frame-Options,
// Strict-Transport-Security, etc. We configure CSP explicitly to control
// which resources the browser is allowed to load.
// Ref: https://helmetjs.github.io/
// Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
// Ref: https://owasp.org/www-project-secure-headers/
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
  })
);

// CORS configured for the Vite dev server (localhost:5173) in development.
// In production, you'd restrict this to your actual domain.
// Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Cap request bodies at 10KB to prevent resource exhaustion attacks.
// OWASP recommends limiting body size:
// https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// NoSQL injection prevention — strip $ and . from user input
// Must come AFTER body parsing so req.body is populated
// Ref: https://www.npmjs.com/package/express-mongo-sanitize
app.use(sanitise);

// HTTP request logging with Morgan, piped through Winston
// Ref: https://www.npmjs.com/package/morgan
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// General rate limiter — applies to all routes as a baseline
// Ref: https://www.npmjs.com/package/express-rate-limit
app.use(generalLimiter);

// Mount API route groups
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/transactions', transactionRoutes);

// Simple health check so we can verify the API is up
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HustleHub+ API is running.',
    timestamp: new Date().toISOString(),
  });
});

// Catch-all for routes that don't exist
app.use((req, res) => {
  sendError(res, 404, 'The requested resource was not found.');
});

// Global error handler — has to be the last middleware in the chain.
// Ref: https://expressjs.com/en/guide/error-handling.html
app.use(errorHandler);

module.exports = app;
