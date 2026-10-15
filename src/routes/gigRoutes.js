// routes/gigRoutes.js — Gig API Routes
// Defines CRUD endpoints for freelancer gig listings.
// All routes require authentication; create/update/delete require freelancer role.
//
// Express routing: https://expressjs.com/en/guide/routing.html
// express-validator validation chains: https://express-validator.github.io/docs/api/validation-chain/
// OWASP Input Validation: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
// Express route parameter ordering matters — specific routes before parameterised:
// https://expressjs.com/en/guide/routing.html#route-paths

const express = require('express');
const { body } = require('express-validator');
const {
  getAllGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
  getMyGigs,
} = require('../controllers/gigController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules for creating/updating a gig
const gigValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['web-development', 'mobile-development', 'design', 'writing', 'marketing', 'data-science', 'other'])
    .withMessage('Category must be one of: web-development, mobile-development, design, writing, marketing, data-science, other'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 1 }).withMessage('Price must be a positive number'),
  body('deliveryTime')
    .trim()
    .notEmpty().withMessage('Delivery time is required'),
];

// All gig routes require authentication
router.use(authenticate);

// IMPORTANT: Mount /my/listings BEFORE /:id so Express doesn't treat "my" as an id.
// Ref: https://expressjs.com/en/guide/routing.html#route-paths
router.get('/my/listings', authorize('freelancer'), getMyGigs);

// GET /api/gigs — browse all active gigs (any authenticated user)
router.get('/', getAllGigs);

// GET /api/gigs/:id — view a single gig (any authenticated user)
router.get('/:id', getGigById);

// POST /api/gigs — create a gig (freelancer only)
router.post('/', authorize('freelancer'), gigValidation, validate, createGig);

// PUT /api/gigs/:id — update a gig (freelancer only, ownership checked in controller)
router.put('/:id', authorize('freelancer'), gigValidation, validate, updateGig);

// DELETE /api/gigs/:id — delete a gig (freelancer only, ownership checked in controller)
router.delete('/:id', authorize('freelancer'), deleteGig);

module.exports = router;
