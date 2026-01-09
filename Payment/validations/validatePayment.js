import Joi from "joi";

const paymentDocumentsSchema = Joi.object({
  gateway: Joi.string()
    .trim()
    .messages({
      "string.base": "Gateway must be a string.",
    })
    .optional(),

  gatewayCode: Joi.string()
    .trim()
    .messages({
      "string.base": "Gateway Code must be a string.",
    })
    .optional(),

  gatewayKey: Joi.string()
    .trim()
    .pattern(/^\S+$/)
    .messages({
      "string.base": "Gateway Key must be a string.",
      "string.pattern.base": "Gateway Key should not contain spaces.",
    })
    .optional(),

  gatewaySecret: Joi.string()
    .trim()
    .pattern(/^\S+$/)
    .messages({
      "string.base": "Gateway Secret must be a string.",
      "string.pattern.base": "Gateway Secret should not contain spaces.",
    })
    .optional(),

  projectId: Joi.string()
    .trim()
    .messages({
      "string.base": "Project ID must be a string.",
    })
    .optional(),

  tenantId: Joi.string().trim().messages({ "string.base": "Tenant ID must be a string" }).optional(),
});

function validatePaymentDocuments(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "Payment documents data must be a valid object.",
      errors: [{ field: "", message: "Payment documents data must be a valid object." }],
    };
  }

  const { error, value } = paymentDocumentsSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid payment documents data.",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "Payment documents data is valid.",
    errors: [],
    value, // Returning the trimmed/validated value
  };
}

export default validatePaymentDocuments;
