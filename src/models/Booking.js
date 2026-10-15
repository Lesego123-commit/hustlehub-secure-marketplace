// models/Booking.js — Booking Mongoose Model
// Represents a client's booking of a freelancer's gig. Links the client,
// freelancer, and gig together with status tracking and pricing.
//
// Mongoose schema docs: https://mongoosejs.com/docs/guide.html
// Mongoose populate (for joining related documents):
// https://mongoosejs.com/docs/populate.html
// Mongoose ObjectId references: https://mongoosejs.com/docs/schematypes.html#objectids
// MongoDB data modelling patterns:
// https://www.mongodb.com/docs/manual/core/data-model-design/

const mongoose = require('mongoose');

// Booking schema definition.
// Each booking references a gig, the client who booked it, and the freelancer
// who owns the gig. Status tracks the lifecycle of the booking.
// Ref: https://mongoosejs.com/docs/guide.html#definition
const bookingSchema = new mongoose.Schema(
  {
    // The gig that was booked
    // Ref: https://mongoosejs.com/docs/populate.html
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: [true, 'Gig reference is required'],
    },
    // The client who made the booking
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client reference is required'],
    },
    // The freelancer who owns the gig — stored for easy querying
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'completed', 'cancelled'],
        message: 'Status must be pending, confirmed, completed, or cancelled',
      },
      default: 'confirmed',
    },
    // Total price at time of booking (snapshot so price changes don't affect it)
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
  },
  {
    // Adds createdAt and updatedAt fields automatically
    // Ref: https://mongoosejs.com/docs/timestamps.html
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Remove __v from JSON responses
// Ref: https://mongoosejs.com/docs/api/document.html#Document.prototype.toJSON()
bookingSchema.methods.toJSON = function () {
  const bookingObject = this.toObject();
  delete bookingObject.__v;
  return bookingObject;
};

// Ref: https://mongoosejs.com/docs/models.html
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
