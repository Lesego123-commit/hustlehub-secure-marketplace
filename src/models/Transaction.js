// models/Transaction.js — Transaction Mongoose Model
// Records financial transactions between clients and freelancers.
// Each transaction is tied to a booking and tracks the payment flow.
//
// Mongoose schema docs: https://mongoosejs.com/docs/guide.html
// Mongoose populate: https://mongoosejs.com/docs/populate.html
// MongoDB data modelling for financial records:
// https://www.mongodb.com/docs/manual/core/data-model-design/
// OWASP guidelines on handling financial data securely:
// https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html

const mongoose = require('mongoose');

// Transaction schema definition.
// Each transaction records who paid (payer/client), who received (payee/freelancer),
// the amount, type, and status. Linked to a booking for audit trail.
// Ref: https://mongoosejs.com/docs/guide.html#definition
const transactionSchema = new mongoose.Schema(
  {
    // The booking this transaction is associated with
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
    },
    // The client who paid
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payer reference is required'],
    },
    // The freelancer who received the payment
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payee reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      enum: {
        values: ['payment', 'refund'],
        message: 'Type must be payment or refund',
      },
      default: 'payment',
    },
    status: {
      type: String,
      enum: {
        values: ['completed', 'pending', 'failed'],
        message: 'Status must be completed, pending, or failed',
      },
      default: 'completed',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
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
transactionSchema.methods.toJSON = function () {
  const transactionObject = this.toObject();
  delete transactionObject.__v;
  return transactionObject;
};

// Ref: https://mongoosejs.com/docs/models.html
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
