import Joi from "joi";

const reviewUpdateSchema = Joi.object({
  product_unique_id: Joi.string().optional().allow("", null).messages({
    "string.base": "Product ID must be a string.",
  }),

  user_unique_id: Joi.string().optional().allow("", null).messages({
    "string.base": "User ID must be a string.",
  }),

  user_name: Joi.string().optional().allow("", null).messages({
    "string.base": "User name must be a string.",
  }),

  rating: Joi.number().min(1).max(5).messages({
    "number.base": "Rating must be a number.",
    "number.min": "Rating must be at least 1.",
    "number.max": "Rating cannot exceed 5.",
  }),

  title: Joi.string().optional().allow("", null).messages({
    "string.base": "Title must be a string.",
  }),

  comment: Joi.string().optional().allow("", null).messages({
    "string.base": "Comment must be a string.",
  }),

  images: Joi.array()
    .items(
      Joi.object({
        original: Joi.string().optional().allow("", null),
        medium: Joi.string().optional().allow("", null),
        low: Joi.string().optional().allow("", null),
      })
    )
    .optional()
    .messages({
      "array.base": "Images must be an array.",
    }),

  is_verified_purchase: Joi.boolean().messages({
    "boolean.base": "Verified purchase value must be boolean.",
  }),

  status: Joi.string().valid("pending", "published", "hidden", "removed").optional().allow("", null).messages({
    "string.base": "Status must be a string.",
    "any.only": "Invalid status value.",
  }),
});

export function validateReviewUpdate(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "Review update data must be a valid object.",
      errors: [{ field: "", message: "Review update data must be a valid object." }],
    };
  }

  const { error } = reviewUpdateSchema.validate(data, { abortEarly: false });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid review update data.",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "Review update data is valid.",
    errors: [],
  };
}
