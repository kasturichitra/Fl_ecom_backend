import Joi from "joi";

const categoryCreateSchema = Joi.object({
  industry_unique_id: Joi.string().required().messages({
    "any.required": "Industry unique ID is required.",
    "string.base": "Industry unique ID must be a string.",
  }),

  category_name: Joi.string().required().trim().messages({
    "any.required": "Category name is required.",
    "string.empty": "Category name cannot be empty.",
    "string.base": "Category name must be a string.",
  }),

  category_unique_id: Joi.string().optional().messages({
    "string.base": "Category unique ID must be a string.",
  }),

  category_image: Joi.object({
    original: Joi.string().optional().allow("", null),
    medium: Joi.string().optional().allow("", null),
    low: Joi.string().optional().allow("", null),
  })
    .optional()
    .allow(null),

  is_active: Joi.boolean().default(true),

  created_by: Joi.string().optional().messages({
    "any.required": "Created by is required.",
    "string.base": "Created by must be a string.",
  }),

  updated_by: Joi.string().optional().allow("", null),

  attributes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        code: Joi.string().required(),
        slug: Joi.string().optional().allow("", null),
        description: Joi.string().optional().allow("", null),
        units: Joi.string().optional().allow("", null),
        is_active: Joi.boolean().default(true),
        created_by: Joi.string().optional().allow("", null),
        updated_by: Joi.string().optional().allow("", null),
      })
    )
    .optional(),
});

export function validateCategoryCreate(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "Category data must be a valid object.",
      errors: [{ field: "", message: "Category data must be a valid object." }],
    };
  }

  const { error } = categoryCreateSchema.validate(data, { abortEarly: false });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid category data.",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "Category data is valid.",
    errors: [],
  };
}
