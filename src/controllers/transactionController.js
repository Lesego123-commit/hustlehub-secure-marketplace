// controllers/transactionController.js — Transaction Business Logic
// Handles listing user transactions and calculating freelancer income summaries
// with a simple South African tax estimate.
//
// Mongoose aggregation framework: https://mongoosejs.com/docs/api/aggregate.html
// MongoDB aggregation pipeline: https://www.mongodb.com/docs/manual/aggregation/
// Mongoose queries: https://mongoosejs.com/docs/queries.html
// South African Revenue Service (SARS) tax info:
// https://www.sars.gov.za/types-of-tax/personal-income-tax/
// Express.js async error handling: https://expressjs.com/en/guide/error-handling.html

const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

// GET /api/transactions
// Returns all transactions where the current user is either the payer or payee.
// Ref: https://mongoosejs.com/docs/api/model.html#Model.find()
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ payer: req.user.id }, { payee: req.user.id }],
    })
      .populate('booking', 'status totalPrice')
      .populate('payer', 'name email')
      .populate('payee', 'name email')
      .sort({ createdAt: -1 });

    logger.info(`Transactions listed: ${transactions.length} for user ${req.user.id}`);

    return sendSuccess(res, 200, 'Transactions retrieved successfully.', { transactions });
  } catch (err) {
    next(err);
  }
};

// GET /api/transactions/income
// Freelancer-only endpoint that aggregates their total income, gives a monthly
// breakdown, and provides an estimated tax liability.
// Uses MongoDB aggregation pipeline for efficient server-side calculations.
// Ref: https://www.mongodb.com/docs/manual/core/aggregation-pipeline/
const getIncomeSummary = async (req, res, next) => {
  try {
    // Only freelancers should access this — enforced in routes but double-check
    if (req.user.role !== 'freelancer') {
      return sendError(res, 403, 'Only freelancers can view income summaries.');
    }

    // Get all completed payment transactions where the user is the payee
    const transactions = await Transaction.find({
      payee: req.user.id,
      type: 'payment',
      status: 'completed',
    }).sort({ createdAt: -1 });

    // Calculate total income
    const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Monthly breakdown using aggregation
    // Groups transactions by year and month, sums the amounts
    // Ref: https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
    const monthlyBreakdown = await Transaction.aggregate([
      {
        $match: {
          payee: new mongoose.Types.ObjectId(req.user.id),
          type: 'payment',
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          income: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    // Format monthly breakdown for readability
    const monthly = monthlyBreakdown.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      income: m.income,
      transactionCount: m.count,
    }));

    // Estimated tax at 25% — a rough SA provisional tax estimate.
    // This is NOT tax advice. The actual rate depends on income brackets.
    // Ref: https://www.sars.gov.za/types-of-tax/personal-income-tax/
    const estimatedTax = Math.round(totalIncome * 0.25 * 100) / 100;

    logger.info(`Income summary for freelancer ${req.user.id}: total R${totalIncome}`);

    const netIncome = Math.round((totalIncome - estimatedTax) * 100) / 100;

    return sendSuccess(res, 200, 'Income summary retrieved successfully.', {
      totalIncome,
      estimatedTax,
      netIncome,
      taxRate: 0.25,
      taxNote: 'This is an estimate based on 25% of gross income. Consult SARS for actual tax obligations.',
      transactionCount: transactions.length,
      monthlyBreakdown: monthly,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTransactions, getIncomeSummary };
