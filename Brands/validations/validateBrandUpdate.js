import Joi from "joi";

const brandUpdateSchema = Joi.object({
  // Basic Info
  brand_name: Joi.string().messages({
    "string.base": "Brand name must be a string.",
  }),

  brand_unique_id: Joi.string().messages({
    "string.base": "Brand unique ID must be a string.",
  }),

  brand_slug: Joi.string().messages({
    "string.base": "Brand slug must be a string.",
  }),

  brand_description: Joi.string().messages({
    "string.base": "Brand description must be a string.",
  }),

  brand_image: Joi.object({
    original: Joi.string().optional().allow("", null),
    medium: Joi.string().optional().allow("", null),
    low: Joi.string().optional().allow("", null),
  }).optional(),
  brand_images: Joi.array()
    .items(
      Joi.object({
        original: Joi.string().optional().allow("", null),
        medium: Joi.string().optional().allow("", null),
        low: Joi.string().optional().allow("", null),
      })
    )
    .optional(),

  // Relations
  categories: Joi.array()
    .items(
      Joi.string().messages({
        "string.base": "Each category ID must be a string.",
      })
    )
    .messages({
      "array.base": "Categories must be an array of category IDs.",
    }),

  // Status
  is_active: Joi.boolean().messages({
    "boolean.base": "is_active must be a boolean value.",
  }),

  created_by: Joi.string().messages({
    "string.base": "Created by must be a string (User ID).",
  }),

  updated_by: Joi.string().messages({
    "string.base": "Updated by must be a string (User ID).",
  }),
});

export function validateBrandUpdate(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "Brand update data must be a valid object.",
      errors: [{ field: "", message: "Brand update data must be a valid object." }],
    };
  }

  const { error } = brandUpdateSchema.validate(data, { abortEarly: false });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid brand update data.",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "Brand update data is valid.",
    errors: [],
  };
}
