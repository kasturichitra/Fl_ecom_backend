/**
 * Success response handler
 * @param {string} message - Success message
 * @param {object} data - Response data (optional)
 * @returns {object} Formatted success response
 */
export const successResponse = (message, data = {}) => {
  const response = {
    status: "success",
    message,
    ...data,
  };

  console.info("✅ Success:", message, data);

  return response;
};

/**
 * Error response handler
 * @param {string} message - Error message
 * @param {object} errors - Error details (optional)
 * @returns {object} Formatted error response
 */
export const errorResponse = (message, errors = {}) => {
  const response = {
    status: "failed",
    message,
    ...errors,
  };

  console.error("❌ Error:", message, errors);

  return response;
};
