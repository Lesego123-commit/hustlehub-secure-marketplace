// controllers/gigController.js — Gig Business Logic
// Handles CRUD operations for freelancer gig listings.
// Only freelancers can create/update/delete gigs; all authenticated users can browse.
//
// Mongoose CRUD operations: https://mongoosejs.com/docs/queries.html
// Mongoose populate for joining documents: https://mongoosejs.com/docs/populate.html
// Express.js async error handling: https://expressjs.com/en/guide/error-handling.html
// REST API resource ownership pattern:
// https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
// OWASP Access Control Cheat Sheet:
// https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html

const Gig = require('../models/Gig');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

// GET /api/gigs
// Returns all active gigs with the freelancer's name and email populated.
// Any authenticated user can browse gigs.
// Ref: https://mongoosejs.com/docs/api/model.html#Model.find()
const getAllGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ status: 'active' })
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    logger.info(`Gigs listed: ${gigs.length} active gigs returned`);

    return sendSuccess(res, 200, 'Gigs retrieved successfully.', { gigs });
  } catch (err) {
    next(err);
  }
};

// GET /api/gigs/:id
// Returns a single gig by its MongoDB ObjectId.
// Ref: https://mongoosejs.com/docs/api/model.html#Model.findById()
const getGigById = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('freelancer', 'name email');

    if (!gig) {
      return sendError(res, 404, 'Gig not found.');
    }

    return sendSuccess(res, 200, 'Gig retrieved successfully.', { gig });
  } catch (err) {
    next(err);
  }
};

// POST /api/gigs
// Freelancer creates a new gig. The freelancer field is set from the JWT
// so users can't create gigs on behalf of someone else.
// Ref: https://mongoosejs.com/docs/api/model.html#Model.create()
const createGig = async (req, res, next) => {
  try {
    const { title, description, category, price, deliveryTime } = req.body;

    const gig = await Gig.create({
      title,
      description,
      category,
      price,
      deliveryTime,
      freelancer: req.user.id,
    });

    // Populate the freelancer field before returning
    await gig.populate('freelancer', 'name email');

    logger.info(`Gig created: "${gig.title}" by user ${req.user.id}`);

    return sendSuccess(res, 201, 'Gig created successfully.', { gig });
  } catch (err) {
    next(err);
  }
};

// PUT /api/gigs/:id
// Updates a gig. Only the freelancer who owns the gig can update it.
// We check ownership before allowing the update to prevent horizontal
// privilege escalation.
// Ref: https://mongoosejs.com/docs/api/model.html#Model.findById()
// OWASP IDOR: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References
const updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return sendError(res, 404, 'Gig not found.');
    }

    // Check ownership — only the freelancer who created the gig can update it
    if (gig.freelancer.toString() !== req.user.id) {
      return sendError(res, 403, 'Access denied. You can only update your own gigs.');
    }

    // Update only the fields that were sent in the request body
    const allowedFields = ['title', 'description', 'category', 'price', 'deliveryTime', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        gig[field] = req.body[field];
      }
    });

    await gig.save();
    await gig.populate('freelancer', 'name email');

    logger.info(`Gig updated: "${gig.title}" (ID: ${gig._id}) by user ${req.user.id}`);

    return sendSuccess(res, 200, 'Gig updated successfully.', { gig });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/gigs/:id
// Deletes a gig. Only the freelancer who owns the gig can delete it.
// Ref: https://mongoosejs.com/docs/api/model.html#Model.findByIdAndDelete()
const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return sendError(res, 404, 'Gig not found.');
    }

    // Check ownership — same IDOR protection as update
    if (gig.freelancer.toString() !== req.user.id) {
      return sendError(res, 403, 'Access denied. You can only delete your own gigs.');
    }

    await Gig.findByIdAndDelete(req.params.id);

    logger.info(`Gig deleted: "${gig.title}" (ID: ${gig._id}) by user ${req.user.id}`);

    return sendSuccess(res, 200, 'Gig deleted successfully.');
  } catch (err) {
    next(err);
  }
};

// GET /api/gigs/my/listings
// Returns all gigs created by the currently authenticated freelancer.
// Ref: https://mongoosejs.com/docs/api/model.html#Model.find()
const getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ freelancer: req.user.id })
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    logger.info(`My gigs listed: ${gigs.length} gigs for user ${req.user.id}`);

    return sendSuccess(res, 200, 'Your gigs retrieved successfully.', { gigs });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllGigs, getGigById, createGig, updateGig, deleteGig, getMyGigs };
