// controllers/bookingController.js — Booking Business Logic
// Handles creating bookings, listing user bookings, and viewing booking details.
// When a client books a gig, a corresponding transaction is also created.
//
// Mongoose transactions for atomic operations:
// https://mongoosejs.com/docs/transactions.html
// Mongoose populate: https://mongoosejs.com/docs/populate.html
// Mongoose CRUD: https://mongoosejs.com/docs/queries.html
// Express.js async error handling: https://expressjs.com/en/guide/error-handling.html
// OWASP Access Control Cheat Sheet:
// https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html

const Gig = require('../models/Gig');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

// POST /api/bookings
// Client books a gig. We check that the gig exists, that the client isn't
// trying to book their own gig, and then create both a booking and a
// transaction record in one operation.
const createBooking = async (req, res, next) => {
  try {
    const { gigId } = req.body;

    // Find the gig and make sure it exists and is active
    // Ref: https://mongoosejs.com/docs/api/model.html#Model.findById()
    const gig = await Gig.findById(gigId).populate('freelancer', 'name email');
    if (!gig) {
      return sendError(res, 404, 'Gig not found.');
    }

    if (gig.status !== 'active') {
      return sendError(res, 400, 'This gig is not currently available for booking.');
    }

    // Prevent freelancers from booking their own gigs
    if (gig.freelancer._id.toString() === req.user.id) {
      return sendError(res, 400, 'You cannot book your own gig.');
    }

    // Create the booking record
    const booking = await Booking.create({
      gig: gig._id,
      client: req.user.id,
      freelancer: gig.freelancer._id,
      totalPrice: gig.price,
      status: 'confirmed',
    });

    // Create a corresponding transaction record for the payment
    // Ref: https://mongoosejs.com/docs/api/model.html#Model.create()
    const transaction = await Transaction.create({
      booking: booking._id,
      payer: req.user.id,
      payee: gig.freelancer._id,
      amount: gig.price,
      type: 'payment',
      status: 'completed',
      description: `Payment for gig: ${gig.title}`,
    });

    // Populate the booking references before returning
    await booking.populate([
      { path: 'gig', select: 'title description category price deliveryTime' },
      { path: 'client', select: 'name email' },
      { path: 'freelancer', select: 'name email' },
    ]);

    logger.info(`Booking created: ${booking._id} — client ${req.user.id} booked gig ${gig._id}`);
    logger.info(`Transaction created: ${transaction._id} — R${gig.price} for gig "${gig.title}"`);

    return sendSuccess(res, 201, 'Booking created successfully.', { booking, transaction });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings
// Returns bookings relevant to the current user.
// Clients see bookings they've made; freelancers see bookings on their gigs.
// Ref: https://mongoosejs.com/docs/api/model.html#Model.find()
const getBookings = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'client') {
      // Clients see their own bookings
      query = Booking.find({ client: req.user.id });
    } else if (req.user.role === 'freelancer') {
      // Freelancers see bookings made on their gigs
      query = Booking.find({ freelancer: req.user.id });
    } else {
      // Admins see all bookings
      query = Booking.find();
    }

    const bookings = await query
      .populate('gig', 'title description category price deliveryTime')
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    logger.info(`Bookings listed: ${bookings.length} bookings for user ${req.user.id}`);

    return sendSuccess(res, 200, 'Bookings retrieved successfully.', { bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
// Returns a single booking. Only the client who booked it or the freelancer
// who owns the gig can view the details.
// Ref: OWASP IDOR prevention:
// https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('gig', 'title description category price deliveryTime')
      .populate('client', 'name email')
      .populate('freelancer', 'name email');

    if (!booking) {
      return sendError(res, 404, 'Booking not found.');
    }

    // Check that the requesting user is either the client or the freelancer
    const isClient = booking.client._id.toString() === req.user.id;
    const isFreelancer = booking.freelancer._id.toString() === req.user.id;

    if (!isClient && !isFreelancer && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied. You can only view your own bookings.');
    }

    return sendSuccess(res, 200, 'Booking retrieved successfully.', { booking });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getBookings, getBookingById };
