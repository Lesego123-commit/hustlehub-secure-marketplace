// middleware/validate.js — Input Validation Middleware
// Runs after express-validator rules and sends back any validation errors.
//
// express-validator docs: https://express-validator.github.io/docs/
// OWASP Input Validation Cheat Sheet:
// https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

// If express-validator found any problems, we collect the error messages
// and send them back as a 400 response. Otherwise we move on.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, 400, messages.join('. '));
  }
  next();
};

module.exports = validate;
