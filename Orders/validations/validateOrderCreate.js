import Joi from "joi";

const addressSchema = Joi.object({
  house_number: Joi.string().trim().required().messages({
    "string.base": "House number must be a string.",
    "any.required": "House number is required.",
  }),

  street: Joi.string().trim().required().messages({
    "string.base": "Street must be a string.",
    "any.required": "Street is required.",
  }),

  landmark: Joi.string().trim().allow("", null).messages({
    "string.base": "Landmark must be a string.",
  }),

  city: Joi.string().trim().required().messages({
    "string.base": "City must be a string.",
    "any.required": "City is required.",
  }),

  district: Joi.string().trim().required().messages({
    "string.base": "District must be a string.",
    "any.required": "District is required.",
  }),

  state: Joi.string().trim().required().messages({
    "string.base": "State must be a string.",
    "any.required": "State is required.",
  }),

  postal_code: Joi.string().trim().required().messages({
    "string.base": "Postal code must be a string.",
    "any.required": "Postal code is required.",
  }),

  country: Joi.string().trim().required().messages({
    "string.base": "Country must be a string.",
    "any.required": "Country is required.",
  }),

  first_name: Joi.string().trim().required().messages({
    "string.base": "First name must be a string.",
    "any.required": "First name is required.",
  }),

  last_name: Joi.string().trim().required().messages({
    "string.base": "Last name must be a string.",
    "any.required": "Last name is required.",
  }),

  mobile_number: Joi.string().trim().required().messages({
    "string.base": "Mobile number must be a string.",
    "any.required": "Mobile number is required.",
  }),

  default: Joi.boolean().optional().messages({
    "boolean.base": "Default must be a boolean.",
  }),

  address_type: Joi.string().valid("Home", "Office", "Other").optional().messages({
    "string.base": "Address type must be a string.",
    "any.only": "Address type must be Home, Office, or Other.",
  }),
});

const orderProductSchema = Joi.object({
  product_unique_id: Joi.string().required().messages({
    "any.required": "Product unique ID is required.",
    "string.base": "Product unique ID must be a string.",
  }),
  product_name: Joi.string().required().messages({
    "any.required": "Product name is required.",
    "string.base": "Product name must be a string.",
  }),
  quantity: Joi.number().min(1).required().messages({
    "any.required": "Quantity is required.",
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be at least 1.",
  }),

  // Unit-level pricing (required from payload)
  unit_base_price: Joi.number().min(0).required().messages({
    "any.required": "Unit base price is required.",
    "number.base": "Unit base price must be a number.",
    "number.min": "Unit base price cannot be negative.",
  }),
  unit_discount_price: Joi.number().min(0).optional().messages({
    "number.base": "Unit discount price must be a number.",
    "number.min": "Unit discount price cannot be negative.",
  }),
  unit_discounted_price: Joi.number().min(0).optional().messages({
    "number.base": "Unit discounted price must be a number.",
    "number.min": "Unit discounted price cannot be negative.",
  }),
  unit_gross_price: Joi.number().min(0).optional().messages({
    "number.base": "Unit gross price must be a number.",
    "number.min": "Unit gross price cannot be negative.",
  }),
  additional_discount_percentage: Joi.number().min(0).optional().messages({
    "number.base": "Additional discount percentage must be a number.",
    "number.min": "Additional discount percentage cannot be negative.",
  }),
  additional_discount_amount: Joi.number().min(0).optional().messages({
    "number.base": "Additional discount amount must be a number.",
    "number.min": "Additional discount amount cannot be negative.",
  }),
  additional_discount_type: Joi.string().valid("percentage", "amount", "coupon").allow(null).optional().messages({
    "string.base": "Additional discount type must be a string.",
    "any.only": "Additional discount type must be percentage or amount or coupon",
  }),
  unit_tax_value: Joi.number().min(0).optional().messages({
    "number.base": "Unit tax value must be a number.",
    "number.min": "Unit tax value cannot be negative.",
  }),
  unit_tax_percentage: Joi.number().min(0).optional().messages({
    "number.base": "Unit tax percentage must be a number.",
    "number.min": "Unit tax percentage cannot be negative.,",
  }),
  unit_final_price: Joi.number().min(0).required().messages({
    "any.required": "Unit final price is required.",
    "number.base": "Unit final price must be a number.",
    "number.min": "Unit final price cannot be negative.",
  }),

  // Total-level pricing (calculated in backend, optional in payload)
  total_base_price: Joi.number().min(0).optional().messages({
    "number.base": "Total base price must be a number.",
    "number.min": "Total base price cannot be negative.",
  }),
  total_gross_price: Joi.number().min(0).optional().messages({
    "number.base": "Total gross price must be a number.",
    "number.min": "Total gross price cannot be negative.",
  }),
  total_discount_price: Joi.number().min(0).optional().messages({
    "number.base": "Total discount price must be a number.",
    "number.min": "Total discount price cannot be negative.",
  }),
  total_tax_value: Joi.number().min(0).optional().messages({
    "number.base": "Total tax value must be a number.",
    "number.min": "Total tax value cannot be negative.",
  }),
  total_final_price: Joi.number().min(0).optional().messages({
    "number.base": "Total final price must be a number.",
    "number.min": "Total final price cannot be negative.",
  }),
});

export const orderValidationSchema = Joi.object({
  order_type: Joi.string().valid("Online", "Offline").required().messages({
    "any.only": "Order type must be Online or Offline.",
    "any.required": "Order type is required.",
  }),
  order_id: Joi.string().trim().allow(null, "").messages({
    "string.base": "Order ID must be a string.",
  }),
  order_id: Joi.string().trim().allow(null, "").messages({
    "string.base": "Order ID must be a string.",
  }),

  // REMOVED Payment fields from here as they are now in PaymentTransaction model
  // payment_status, payment_method, transaction_id are handled separately or by Payment validations

  order_create_date: Joi.date().required().messages({
    "date.base": "Order create date must be a valid date.",
    "any.required": "Order create date is required.",
  }),

  order_cancel_date: Joi.date().allow(null).messages({
    "date.base": "Order cancel date must be a valid date.",
  }),

  order_delivery_date: Joi.date().allow(null).messages({
    "date.base": "Order cancel date must be a valid date.",
  }),

  order_refund_date: Joi.date().allow(null).messages({
    "date.base": "Order cancel date must be a valid date.",
  }),

  order_status_history: Joi.array()
    .items(
      Joi.object({
        status: Joi.string()
          .valid(
            "Pending",
            "Processing",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
            "Returned",
            "Refunded",
          )
          .required(),
        updated_at: Joi.date().optional(),
        updated_by: Joi.string().allow(null, "").optional(),
        note: Joi.string().allow(null, "").optional(),
      }),
    )
    .required()
    .messages({
      "array.base": "Order status history must be an array.",
      "any.required": "Order status history is required.",
    }),

  order_products: Joi.array().items(orderProductSchema).min(1).required().messages({
    "array.base": "Order products must be an array.",
    "array.min": "At least one product is required.",
    "any.required": "Order products are required.",
  }),

  base_price: Joi.number().min(0).optional().messages({
    "number.base": "Base price must be a number.",
    "number.min": "Base price cannot be negative.",
  }),

  is_from_cart: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Is from cart must be a boolean.",
  }),

  tax_value: Joi.number().min(0).optional().messages({
    "number.base": "Tax value must be a number.",
    "number.min": "Tax value cannot be negative.",
  }),

  gross_price: Joi.number().min(0).optional().messages({
    "number.base": "Gross price must be a number.",
    "number.min": "Gross price cannot be negative.",
  }),

  discount_price: Joi.number().min(0).optional().messages({
    "number.base": "Discount price must be a number.",
    "number.min": "Discount price cannot be negative.",
  }),

  total_amount: Joi.number().min(0).optional().messages({
    "number.base": "Total amount must be a number.",
    "number.min": "Total amount cannot be negative.",
    "any.required": "Total amount is required.",
  }),

  additional_discount_percentage: Joi.number().min(0).optional().messages({
    "number.base": "Additional discount percentage must be a number.",
    "number.min": "Additional discount percentage cannot be negative.",
  }),
  additional_discount_amount: Joi.number().min(0).optional().messages({
    "number.base": "Additional discount amount must be a number.",
    "number.min": "Additional discount amount cannot be negative.",
  }),
  additional_discount_type: Joi.string().valid("percentage", "amount", "coupon").allow(null).optional().messages({
    "string.base": "Additional discount type must be a string.",
    "any.only": "Additional discount type must be percentage or amount or coupon",
  }),

  currency: Joi.string().default("INR").messages({
    "string.base": "Currency must be a string.",
  }),

  // ----------------------------------------------------
  // 🔥 Conditional Fields
  // ----------------------------------------------------

  // 🧍‍♂ Offline: Required
  customer_name: Joi.string()
    .trim()
    .when("order_type", {
      is: "Offline",
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    })
    .messages({
      "string.base": "Customer name must be a string.",
      "any.required": "Customer name is required for offline orders.",
    }),

  mobile_number: Joi.string()
    .trim()
    .when("order_type", {
      is: "Offline",
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    })
    .messages({
      "string.base": "Mobile number must be a string.",
      "any.required": "Mobile number is required for offline orders.",
    }),

  // 📦 Online: Required
  address: Joi.when("order_type", {
    is: "Online",
    then: addressSchema.required().messages({
      "any.required": "Address is required for online orders.",
      // "any.unknown": "Address is not allowed for offline orders.",
    }),
    otherwise: Joi.forbidden(),
  }),

  offline_address: Joi.when("order_type", {
    is: "Offline",
    then: Joi.string().trim().optional().allow("", null).messages({
      "string.base": "Offline address must be a string.",
    }),
    otherwise: Joi.forbidden(),
  }),

  shipping_charges: Joi.when("order_type", {
    is: "Online",
    then: Joi.number().min(0).required().messages({
      "number.base": "Shipping charges must be a number.",
      "number.min": "Shipping charges cannot be negative.",
      "any.required": "Shipping charges are required for online orders.",
    }),

    otherwise: Joi.number().valid(0).default(0).messages({
      "number.base": "Shipping charges must be a number.",
      "any.only": "Shipping charges must be 0 for offline orders.",
    }),
  }),

  cash_on_delivery: Joi.when("order_type", {
    is: "Online",
    then: Joi.boolean().required().messages({
      "boolean.base": "Cash on delivery must be a boolean.",
      "any.required": "Cash on delivery is required for online orders.",
    }),

    // In case of offline deliveries, cash on delivery is always true
    otherwise: Joi.boolean().default(true).messages({
      "boolean.base": "Cash on delivery must be a boolean.",
      "any.only": "Cash on delivery must be true for offline orders.",
    }),
  }),

  user_id: Joi.when("order_type", {
    is: "Online",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }).messages({
    "string.base": "User ID must be a string.",
    "any.required": "User ID is required for online orders.",
    "any.unknown": "User ID is not allowed for offline orders.",
  }),
});

export function validateOrderCreate(data) {
  const { error } = orderValidationSchema.validate(data, { abortEarly: false });

  if (error) {
    return {
      isValid: false,
      message: error.details[0].message,
      errors: error.details.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  return { isValid: true, message: "Order data is valid.", errors: [] };
}
