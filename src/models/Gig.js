// models/Gig.js — Gig Mongoose Model
// Defines the schema for freelancer service listings (gigs) in the marketplace.
// Each gig belongs to a freelancer and can be browsed/booked by clients.
//
// Mongoose schema docs: https://mongoosejs.com/docs/guide.html
// Mongoose populate (for joining freelancer data): https://mongoosejs.com/docs/populate.html
// Mongoose schema types and validators: https://mongoosejs.com/docs/schematypes.html
// MongoDB ObjectId references: https://mongoosejs.com/docs/schematypes.html#objectids
// Express.js REST API design patterns:
// https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design

const mongoose = require('mongoose');

// Gig schema definition.
// Each gig has a title, description, category, price, delivery time,
// and a reference to the freelancer who created it.
// Ref: https://mongoosejs.com/docs/guide.html#definition
const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gig title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Gig description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'web-development',
          'mobile-development',
          'design',
          'writing',
          'marketing',
          'data-science',
          'other',
        ],
        message: 'Category must be one of: web-development, mobile-development, design, writing, marketing, data-science, other',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least 1'],
    },
    deliveryTime: {
      type: String,
      required: [true, 'Delivery time is required'],
      trim: true,
    },
    // Reference to the freelancer who owns this gig.
    // We populate this field to get the freelancer's name and email.
    // Ref: https://mongoosejs.com/docs/populate.html
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'paused'],
        message: 'Status must be active or paused',
      },
      default: 'active',
    },
  },
  {
    // Adds createdAt and updatedAt fields automatically
    // Ref: https://mongoosejs.com/docs/timestamps.html
    timestamps: true,
  }
);

// Remove __v from JSON responses for cleaner output
// Ref: https://mongoosejs.com/docs/api/document.html#Document.prototype.toJSON()
gigSchema.methods.toJSON = function () {
  const gigObject = this.toObject();
  delete gigObject.__v;
  return gigObject;
};

// Ref: https://mongoosejs.com/docs/models.html
const Gig = mongoose.model('Gig', gigSchema);

module.exports = Gig;
