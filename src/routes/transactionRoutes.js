// routes/transactionRoutes.js — Transaction API Routes
// Defines endpoints for viewing transactions and freelancer income summaries.
// All routes require authentication; income summary is freelancer-only.
//
// Express routing: https://expressjs.com/en/guide/routing.html
// OWASP Access Control Cheat Sheet:
// https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html
// MongoDB aggregation for income calculations:
// https://www.mongodb.com/docs/manual/aggregation/

const express = require('express');
const { getTransactions, getIncomeSummary } = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All transaction routes require authentication
router.use(authenticate);

// GET /api/transactions — list user's transactions (payer or payee)
router.get('/', getTransactions);

// GET /api/transactions/income — freelancer income summary with tax estimate
router.get('/income', authorize('freelancer'), getIncomeSummary);

module.exports = router;
