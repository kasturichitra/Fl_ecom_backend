import Joi from "joi";

const productUpdateValidationSchema = Joi.object({
  category_unique_Id: Joi.string().messages({
    "string.base": "Category unique ID must be a string.",
  }),

  products_unique_ID: Joi.string().messages({
    "string.base": "Product unique ID must be a string.",
  }),

  product_name: Joi.string().trim().messages({
    "string.base": "Product name must be a string.",
  }),

  barcode: Joi.string().trim().messages({
    "string.base": "Barcode must be a string.",
  }),

  price: Joi.number().min(0).messages({
    "number.base": "Price must be a number.",
    "number.min": "Price must be 0 or greater.",
  }),

  stock_quantity: Joi.number().min(0).messages({
    "number.base": "Stock quantity must be a number.",
    "number.min": "Stock quantity cannot be negative.",
  }),

  min_order_limit: Joi.number().min(1).messages({
    "number.base": "Minimum order limit must be a number.",
    "number.min": "Minimum order limit must be at least 1.",
  }),

  max_order_limit: Joi.number().min(1).messages({
    "number.base": "Maximum order limit must be a number.",
    "number.min": "Maximum order limit must be at least 1.",
  }),

  // Brand ID only needs to be a string now
  product_brand_Id: Joi.string().messages({
    "string.base": "Brand ID must be a string.",
  }),

  product_slug: Joi.string(),
  product_description: Joi.string(),
  long_description: Joi.string(),
  product_type: Joi.string(),
  product_color: Joi.string().messages({
    "string.base": "Product color must be a string.",
  }),
  product_size: Joi.string(),
  model_number: Joi.string(),
  sku: Joi.string(),

  basePrice: Joi.number().min(0).messages({
    "number.base": "Base price must be a number.",
    "number.min": "Base price must be 0 or greater.",
  }),

  salePrice: Joi.number().min(0).messages({
    "number.base": "Sale price must be a number.",
    "number.min": "Sale price must be 0 or greater.",
  }),

  costPrice: Joi.number().min(0).messages({
    "number.base": "Cost price must be a number.",
    "number.min": "Cost price must be 0 or greater.",
  }),

  discount_percentage: Joi.number().min(0).max(100).messages({
    "number.base": "Discount percentage must be a number.",
    "number.min": "Discount percentage must be 0 or greater.",
    "number.max": "Discount percentage cannot exceed 100.",
  }),

  discount_price: Joi.number().min(0).messages({
    "number.base": "Discount price must be a number.",
    "number.min": "Discount price must be 0 or greater.",
  }),

  currency: Joi.string(),
  discount_type: Joi.string(),
  discount_coupon: Joi.string(),

  product_GST: Joi.number().min(0).messages({
    "number.base": "GST must be a number.",
    "number.min": "GST must be 0 or greater.",
  }),

  GST_number: Joi.string(),

  cgst: Joi.number().min(0).messages({
    "number.base": "CGST must be a number.",
    "number.min": "CGST must be 0 or greater.",
  }),

  sgst: Joi.number().min(0).messages({
    "number.base": "SGST must be a number.",
    "number.min": "SGST must be 0 or greater.",
  }),

  igst: Joi.number().min(0).messages({
    "number.base": "IGST must be a number.",
    "number.min": "IGST must be 0 or greater.",
  }),

  tax_value: Joi.number().min(0).messages({
    "number.base": "Tax value must be a number.",
    "number.min": "Tax value must be 0 or greater.",
  }),

  stock_availability: Joi.boolean(),
  low_stock_threshold: Joi.number().min(0).messages({
    "number.base": "Low stock threshold must be a number.",
    "number.min": "Low stock threshold must be 0 or greater.",
  }),

  gender: Joi.string().valid("Men", "Women", "Unisex", "Kids", "Other"),

  age: Joi.number().min(0).messages({
    "number.base": "Age must be a number.",
    "number.min": "Age must be 0 or greater.",
  }),

  country_of_origin: Joi.string(),
  tag: Joi.string(),

  minimum_age: Joi.number().min(0).messages({
    "number.base": "Minimum age must be a number.",
    "number.min": "Minimum age must be 0 or greater.",
  }),

  maximum_age: Joi.number().min(0).messages({
    "number.base": "Maximum age must be a number.",
    "number.min": "Maximum age must be 0 or greater.",
  }),

  age_group: Joi.string(),

  product_warranty: Joi.string(),
  warranty_type: Joi.string(),
  return_policy: Joi.string(),

  replacement_available: Joi.boolean(),

  shipping_charges: Joi.number().min(0).messages({
    "number.base": "Shipping charges must be a number.",
    "number.min": "Shipping charges must be 0 or greater.",
  }),

  delivery_time: Joi.string(),
  cash_on_delivery: Joi.boolean(),

  product_image: Joi.string(),
  product_images: Joi.array().items(Joi.string()),

  product_attributes: Joi.alternatives()
    .try(
      Joi.array().items(
        Joi.object({
          attribute_code: Joi.string().required(),
          value: Joi.alternatives()
            .try(Joi.string(), Joi.number(), Joi.boolean())
            .required(),
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

export function validateProductUpdateData(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "Product update data must be a valid object.",
      errors: [
        {
          field: "",
          message: "Product update data must be a valid object.",
        },
      ],
    };
  }

  const { error } = productUpdateValidationSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid product update data.",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "Product update data is valid.",
    errors: [],
  };
}
