import Joi from "joi";

const productValidationSchema = Joi.object({
  category_unique_id: Joi.string().required().messages({
    "any.required": "Category unique ID is required.",
    "string.empty": "Category unique ID cannot be empty.",
  }),

  industry_unique_id: Joi.string().required().messages({
    "any.required": "Industry unique ID is required.",
    "string.empty": "Industry unique ID cannot be empty.",
  }),

  product_unique_id: Joi.string().required().messages({
    "any.required": "Product unique ID is required.",
    "string.empty": "Product unique ID cannot be empty.",
    "string.base": "Product Unique Id must be a string",
  }),

  brand_name: Joi.string().optional().messages({
    "string.base": "Brand name must be a string.",
  }),

  category_name: Joi.string().optional().messages({
    "string.base": "Category name must be a string.",
  }),

  product_name: Joi.string().trim().required().messages({
    "any.required": "Product name is required.",
    "string.empty": "Product name cannot be empty.",
  }),

  // product_code: Joi.string()
  //   .trim()
  //   .required()
  //   .messages({
  //     "any.required": "Product code is required.",
  //     "string.empty": "Product code cannot be empty.",
  //   }),

  barcode: Joi.string()
    .trim()
    .messages({
      "string.base": "Barcode must be a string.",
    })
    .optional(),

  stock_quantity: Joi.number().min(0).required().messages({
    "any.required": "Stock quantity is required.",
    "number.min": "Stock quantity cannot be negative.",
  }),

  min_order_limit: Joi.number().min(1).required().messages({
    "any.required": "Minimum order limit is required.",
    "number.min": "Minimum order limit must be at least 1.",
  }),

  max_order_limit: Joi.number()
    .messages({
      "number.min": "Maximum order limit must be at least 1.",
    })
    .optional(),

  brand_unique_id: Joi.string()
    .messages({
      "string.base": "Product brand ID must be a string.",
      "any.required": "Product brand ID is required.",
    })
    .required(),

  product_slug: Joi.string().optional(),
  product_description: Joi.string().optional(),
  long_description: Joi.string().optional(),
  product_type: Joi.string().optional(),
  product_color: Joi.string().optional(),
  product_size: Joi.string().optional(),
  model_number: Joi.string().optional(),
  sku: Joi.string().optional(),

  base_price: Joi.number().min(0).required().messages({
    "any.required": "Base price is required.",
    "number.min": "Base price must be 0 or greater.",
  }),

  gross_price: Joi.number().min(0).optional().messages({
    "number.base": "Gross price must be a number.",
    "number.min": "Gross price must be 0 or greater.",
  }),

  final_price: Joi.number().min(0).optional().messages({
    "number.base": "Final price must be a number.",
    "number.min": "Final price must be 0 or greater.",
  }),

  discounted_price: Joi.number().min(0).optional(),

  discount_percentage: Joi.number().min(0).max(100).optional(),
  discount_price: Joi.number().min(0).optional(),

  currency: Joi.string().default("INR"),
  discount_type: Joi.string().optional(),
  discount_coupon: Joi.string().optional(),

  cgst: Joi.number().min(0).optional(),
  sgst: Joi.number().min(0).optional(),
  igst: Joi.number().min(0).optional(),
  tax_value: Joi.number().min(0).optional(),

  low_stock_threshold: Joi.number().optional(),

  gender: Joi.string().valid("Men", "Women", "Unisex", "Kids", "Other").default("Unisex"),
  tag: Joi.string().optional(),
  minimum_age: Joi.number().min(0).optional(),
  maximum_age: Joi.number().min(0).optional(),
  age_group: Joi.string().optional(),

  product_warranty: Joi.string().optional(),
  warranty_type: Joi.string().optional(),
  return_policy: Joi.string().optional(),

  replacement_available: Joi.boolean().default(true),
  shipping_charges: Joi.number().min(0).default(0),
  delivery_time: Joi.string().optional(),
  cash_on_delivery: Joi.boolean().default(true),

  product_image: Joi.string().optional(),
  product_images: Joi.array().items(Joi.string()).optional(),

  product_attributes: Joi.alternatives()
    .try(
      Joi.array().items(
        Joi.object({
          attribute_code: Joi.string().required(),
          value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean()).required(),
        })
      ),
      Joi.string().custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) return helpers.error("any.invalid");
          return parsed;
        } catch (err) {
          return helpers.error("any.invalid");
        }
      }, "JSON parsing")
    )
    .optional(),
});

export function validateProductData(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "Product data must be a valid object",
      errors: [{ field: "", message: "Product data must be a valid object" }],
    };
  }

  const { error, value } = productValidationSchema.validate(data, {
    abortEarly: false, // collect all errors
  });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid product data",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "Product data is valid.",
    errors: [],
  };
}
