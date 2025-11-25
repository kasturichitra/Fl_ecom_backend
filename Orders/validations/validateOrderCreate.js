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
  price: Joi.number().min(0).required().messages({
    "any.required": "Price is required.",
    "number.base": "Price must be a number.",
    "number.min": "Price cannot be negative.",
  }),
  discount_price: Joi.number().min(0).messages({
    "number.base": "Discount price must be a number.",
    "number.min": "Discount price cannot be negative.",
  }),
  total_price: Joi.number().min(0).required().messages({
    "any.required": "Total price is required.",
    "number.base": "Total price must be a number.",
    "number.min": "Total price cannot be negative.",
  }),
  tax_amount: Joi.number().min(0).messages({
    "number.base": "Tax amount must be a number.",
    "number.min": "Tax amount cannot be negative.",
  }),
});

export const orderValidationSchema = Joi.object({
  order_type: Joi.string().valid("Online", "Offline").required().messages({
    "any.only": "Order type must be Online or Offline.",
    "any.required": "Order type is required.",
  }),

  payment_status: Joi.string().valid("Pending", "Paid", "Failed", "Refunded").default("Pending").messages({
    "any.only": "Payment status is invalid.",
  }),

  payment_method: Joi.string()
    .valid("Cash", "Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet")
    .required()
    .messages({
      "any.required": "Payment method is required.",
      "any.only": "Invalid payment method.",
    }),

  transaction_id: Joi.string().trim().allow(null, "").messages({
    "string.base": "Transaction ID must be a string.",
  }),

  order_create_date: Joi.date().required().messages({
    "date.base": "Order create date must be a valid date.",
    "any.required": "Order create date is required.",
  }),

  order_cancel_date: Joi.date().allow(null).messages({
    "date.base": "Order cancel date must be a valid date.",
  }),

  order_status: Joi.string()
    .valid("Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned")
    .default("Pending")
    .messages({
      "any.only": "Invalid order status.",
    }),

  order_products: Joi.array().items(orderProductSchema).min(1).required().messages({
    "array.base": "Order products must be an array.",
    "array.min": "At least one product is required.",
    "any.required": "Order products are required.",
  }),

  // tax_amount: Joi.number().min(0).default(0).messages({
  //   "number.base": "Tax amount must be a number.",
  //   "number.min": "Tax amount cannot be negative.",
  // }),

  subtotal: Joi.number().min(0).required().messages({
    "number.base": "Subtotal must be a number.",
    "number.min": "Subtotal cannot be negative.",
    "any.required": "Subtotal is required.",
  }),

  total_amount: Joi.number().min(0).required().messages({
    "number.base": "Total amount must be a number.",
    "number.min": "Total amount cannot be negative.",
    "any.required": "Total amount is required.",
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
