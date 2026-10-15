// utils/response.js — Consistent JSON Response Helpers
// Every API response follows the same shape: { success, message, data? }
// This keeps things predictable for whoever builds the frontend.
//
// We based this pattern on Microsoft's REST API guidelines:
// https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
// and the JSON:API spec: https://jsonapi.org/format/

// Send a success response with optional data payload
const sendSuccess = (res, statusCode, message, data = null) => {
  const response = { success: true, message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

// Send an error response — never includes stack traces or internal info
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
