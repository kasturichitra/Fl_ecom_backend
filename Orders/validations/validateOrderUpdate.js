import Joi from "joi";

const addressSchemaUpdate = Joi.object({
  house_number: Joi.string(),
  street: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  postal_code: Joi.string(),
  country: Joi.string(),
});

const orderProductSchemaUpdate = Joi.object({
  product_unique_id: Joi.string().messages({
    "string.base": "Product unique ID must be a string.",
  }),
  product_name: Joi.string().messages({
    "string.base": "Product name must be a string.",
  }),
  quantity: Joi.number().min(1).messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be at least 1.",
  }),
  price: Joi.number().min(0).messages({
    "number.base": "Price must be a number.",
    "number.min": "Price cannot be negative.",
  }),
  discount_price: Joi.number().min(0).messages({
    "number.base": "Discount price must be a number.",
    "number.min": "Discount price cannot be negative.",
  }),
  total_price: Joi.number().min(0).messages({
    "number.base": "Total price must be a number.",
    "number.min": "Total price cannot be negative.",
  }),
  tax_amount: Joi.number().min(0).messages({
    "number.base": "Tax amount must be a number.",
    "number.min": "Tax amount cannot be negative.",
  }),
});

const orderUpdateSchema = Joi.object({
  user_id: Joi.string().trim().messages({
    "string.base": "User ID must be a string.",
  }),

  payment_status: Joi.string().valid("Pending", "Paid", "Failed", "Refunded").messages({
    "string.base": "Payment status must be a string.",
    "any.only": "Invalid payment status.",
  }),

  payment_method: Joi.string().valid("Cash", "Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet").messages({
    "string.base": "Payment method must be a string.",
    "any.only": "Invalid payment method.",
  }),

  transaction_id: Joi.string(),

  order_create_date: Joi.date().messages({
    "date.base": "Order create date must be a valid date.",
  }),

  order_cancel_date: Joi.date().messages({
    "date.base": "Order cancel date must be a valid date.",
  }),

  order_status: Joi.string().valid("Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned").messages({
    "string.base": "Order status must be a string.",
    "any.only": "Invalid order status.",
  }),

  order_products: Joi.array().items(orderProductSchemaUpdate),

  address: addressSchemaUpdate,

  subtotal: Joi.number().min(0),
  shipping_charges: Joi.number().min(0),
  total_amount: Joi.number().min(0),

  currency: Joi.string(),
});

export function validateOrderUpdate(data) {
  const { error } = orderUpdateSchema.validate(data, { abortEarly: false });

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

  return {
    isValid: true,
    message: "Order update data is valid.",
    errors: [],
  };
}
