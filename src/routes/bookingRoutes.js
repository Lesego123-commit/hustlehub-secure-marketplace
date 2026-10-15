// routes/bookingRoutes.js — Booking API Routes
// Defines endpoints for creating and viewing gig bookings.
// Only clients can create bookings; both clients and freelancers can view them.
//
// Express routing: https://expressjs.com/en/guide/routing.html
// express-validator validation chains: https://express-validator.github.io/docs/api/validation-chain/
// OWASP Input Validation: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
// express-rate-limit: https://www.npmjs.com/package/express-rate-limit
// MongoDB ObjectId validation with Mongoose:
// https://mongoosejs.com/docs/schematypes.html#objectids

const express = require('express');
const { body } = require('express-validator');
const { createBooking, getBookings, getBookingById } = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { bookingLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules for creating a booking
const bookingValidation = [
  body('gigId')
    .notEmpty().withMessage('Gig ID is required')
    .isMongoId().withMessage('Gig ID must be a valid MongoDB ObjectId'),
];

// All booking routes require authentication
router.use(authenticate);

// POST /api/bookings — client books a gig (rate limited)
router.post('/', authorize('client'), bookingLimiter, bookingValidation, validate, createBooking);

// GET /api/bookings — list user's bookings
router.get('/', getBookings);

// GET /api/bookings/:id — view a single booking
router.get('/:id', getBookingById);

module.exports = router;
