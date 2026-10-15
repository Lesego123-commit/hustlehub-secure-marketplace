// middleware/sanitise.js — NoSQL Injection Prevention
// Uses express-mongo-sanitize to strip out characters like $ and . from
// user input, preventing NoSQL injection attacks against MongoDB.
//
// express-mongo-sanitize docs: https://www.npmjs.com/package/express-mongo-sanitize
// OWASP NoSQL Injection prevention:
// https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html
// MongoDB security best practices:
// https://www.mongodb.com/docs/manual/administration/security-checklist/
// OWASP Testing for NoSQL Injection:
// https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection

const mongoSanitize = require('express-mongo-sanitize');

// Replaces any keys containing $ or . with underscores.
// This stops attackers from injecting MongoDB operators like $gt, $ne, $regex
// into query parameters or request bodies.
// Example attack prevented: { "email": { "$gt": "" }, "password": { "$gt": "" } }
// Ref: https://www.npmjs.com/package/express-mongo-sanitize#how-does-it-work
const sanitise = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    // Log when sanitisation strips dangerous input (useful for security auditing)
    console.warn(`[SECURITY] Sanitised key "${key}" in request from ${req.ip}`);
  },
});

module.exports = sanitise;
