import Joi from "joi";

const addressSchema = Joi.object({
  house_number: Joi.string().allow(null, "").messages({
    "string.base": "House number must be a string.",
  }),
  street: Joi.string().allow(null, "").messages({
    "string.base": "Street must be a string.",
  }),
  city: Joi.string().allow(null, "").messages({
    "string.base": "City must be a string.",
  }),
  state: Joi.string().allow(null, "").messages({
    "string.base": "State must be a string.",
  }),
  postal_code: Joi.string().allow(null, "").messages({
    "string.base": "Postal code must be a string.",
  }),
  country: Joi.string().allow(null, "").messages({
    "string.base": "Country must be a string.",
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

const orderCreateSchema = Joi.object({
  user_id: Joi.string().trim().required().messages({
    "any.required": "User ID is required.",
    "string.base": "User ID must be a string.",
  }),

  payment_status: Joi.string().valid("Pending", "Paid", "Failed", "Refunded").messages({
    "string.base": "Payment status must be a string.",
    "any.only": "Invalid payment status.",
  }),

  payment_method: Joi.string()
    .valid("COD", "Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet")
    .required()
    .messages({
      "any.required": "Payment method is required.",
      "string.base": "Payment method must be a string.",
      "any.only": "Invalid payment method.",
    }),

  transaction_id: Joi.string().allow(null, "").messages({
    "string.base": "Transaction ID must be a string.",
  }),

  order_create_date: Joi.date().required().messages({
    "any.required": "Order create date is required.",
    "date.base": "Order create date must be a valid date.",
  }),

  order_cancel_date: Joi.date().messages({
    "date.base": "Order cancel date must be a valid date.",
  }),

  order_status: Joi.string().valid("Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned").messages({
    "string.base": "Order status must be a string.",
    "any.only": "Invalid order status.",
  }),

  order_products: Joi.array().items(orderProductSchema).min(1).required().messages({
    "any.required": "Order products are required.",
    "array.base": "Order products must be an array.",
    "array.min": "At least one product is required.",
  }),

  address: addressSchema,

  subtotal: Joi.number().min(0).required().messages({
    "any.required": "Subtotal is required.",
    "number.base": "Subtotal must be a number.",
    "number.min": "Subtotal cannot be negative.",
  }),

  shipping_charges: Joi.number().min(0).messages({
    "number.base": "Shipping charges must be a number.",
    "number.min": "Shipping charges cannot be negative.",
  }),

  tax_amount: Joi.number().min(0).messages({
    "number.base": "Tax amount must be a number.",
    "number.min": "Tax amount cannot be negative.",
  }),

  total_amount: Joi.number().min(0).required().messages({
    "any.required": "Total amount is required.",
    "number.base": "Total amount must be a number.",
    "number.min": "Total amount cannot be negative.",
  }),

  currency: Joi.string().messages({
    "string.base": "Currency must be a string.",
  }),
});

export function validateOrderCreate(data) {
  const { error } = orderCreateSchema.validate(data, { abortEarly: false });

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
