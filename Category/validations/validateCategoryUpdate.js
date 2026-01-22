import Joi from "joi";

const categoryUpdateSchema = Joi.object({
  industry_unique_id: Joi.string().messages({
    "string.base": "Industry unique ID must be a string.",
  }),

  category_name: Joi.string().trim().messages({
    "string.base": "Category name must be a string.",
  }),

  category_unique_id: Joi.string().messages({
    "string.base": "Category unique ID must be a string.",
  }),

  category_image: Joi.object({
    original: Joi.string().optional().allow("", null),
    medium: Joi.string().optional().allow("", null),
    low: Joi.string().optional().allow("", null),
  }).optional(),

  is_active: Joi.boolean(),

  created_by: Joi.string().messages({
    "string.base": "Created by must be a string.",
  }),

  updated_by: Joi.string().messages({
    "string.base": "Updated by must be a string.",
  }),

  attributes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().optional(),
        code: Joi.string().required(),
        // slug: Joi.string().optional(),
        // description: Joi.string().optional(),
        units: Joi.string().optional(),
        // is_active: Joi.boolean(),
        // created_by: Joi.string().optional(),
        // updated_by: Joi.string().optional(),
      })
    )
    .optional(),
});

export function validateCategoryUpdate(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "Category update data must be a valid object.",
      errors: [{ field: "", message: "Category update data must be a valid object." }],
    };
  }

  const { error } = categoryUpdateSchema.validate(data, { abortEarly: false });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid category update data.",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "Category update data is valid.",
    errors: [],
  };
}
