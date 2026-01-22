import Joi from "joi";

const addressSchemaUpdate = Joi.object({
  house_number: Joi.string(),
  street: Joi.string(),
  landmark: Joi.string(),
  city: Joi.string(),
  district: Joi.string(),
  state: Joi.string(),
  postal_code: Joi.string(),
  country: Joi.string(),
  first_name: Joi.string(),
  last_name: Joi.string(),
  mobile_number: Joi.string(),
  default: Joi.boolean(),
  address_type: Joi.string().valid("Home", "Office", "Other"),
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

  // Unit-level pricing
  unit_base_price: Joi.number().min(0).messages({
    "number.base": "Unit base price must be a number.",
    "number.min": "Unit base price cannot be negative.",
  }),
  unit_discount_price: Joi.number().min(0).messages({
    "number.base": "Unit discount price must be a number.",
    "number.min": "Unit discount price cannot be negative.",
  }),
  unit_discounted_price: Joi.number().min(0).messages({
    "number.base": "Unit discounted price must be a number.",
    "number.min": "Unit discounted price cannot be negative.",
  }),
  additional_discount_percentage: Joi.number().min(0).messages({
    "number.base": "Additional discount percentage must be a number.",
    "number.min": "Additional discount percentage cannot be negative.",
  }),
  additional_discount_amount: Joi.number().min(0).messages({
    "number.base": "Additional discount amount must be a number.",
    "number.min": "Additional discount amount cannot be negative.",
  }),
  additional_discount_type: Joi.string().valid("percentage", "amount", "coupon").allow(null).optional().messages({
    "string.base": "Additional discount type must be a string.",
    "any.only": "Additional discount type must be percentage or amount or coupon",
  }),
  unit_tax_value: Joi.number().min(0).messages({
    "number.base": "Unit tax value must be a number.",
    "number.min": "Unit tax value cannot be negative.",
  }),
  unit_tax_percentage: Joi.number().min(0).messages({
    "number.base": "Unit tax percentage must be a number.",
    "number.min": "Unit tax percentage cannot be negative.",
  }),
  unit_final_price: Joi.number().min(0).messages({
    "number.base": "Unit final price must be a number.",
    "number.min": "Unit final price cannot be negative.",
  }),

  // Total-level pricing
  total_base_price: Joi.number().min(0).messages({
    "number.base": "Total base price must be a number.",
    "number.min": "Total base price cannot be negative.",
  }),
  total_discount_price: Joi.number().min(0).messages({
    "number.base": "Total discount price must be a number.",
    "number.min": "Total discount price cannot be negative.",
  }),
  total_tax_value: Joi.number().min(0).messages({
    "number.base": "Total tax value must be a number.",
    "number.min": "Total tax value cannot be negative.",
  }),
  total_final_price: Joi.number().min(0).messages({
    "number.base": "Total final price must be a number.",
    "number.min": "Total final price cannot be negative.",
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

  order_delivery_date: Joi.date().messages({
    "date.base": "Order delivery date must be a valid date.",
  }),

  order_return_date: Joi.date().messages({
    "date.base": "Order return date must be a valid date.",
  }),

  order_status: Joi.string()
    .valid("Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned", "Refunded")
    .messages({
      "string.base": "Order status must be a string.",
      "any.only": "Invalid order status.",
    }),

  order_products: Joi.array().items(orderProductSchemaUpdate),

  is_from_cart: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Is from cart must be a boolean.",
  }),

  address: addressSchemaUpdate,

  base_price: Joi.number().min(0),
  tax_value: Joi.number().min(0),
  discount_price: Joi.number().min(0),
  total_amount: Joi.number().min(0),

  additional_discount_percentage: Joi.number().min(0),
  additional_discount_amount: Joi.number().min(0),
  additional_discount_type: Joi.string().valid("percentage", "amount", "coupon").allow(null).optional().messages({
    "string.base": "Additional discount type must be a string.",
    "any.only": "Additional discount type must be percentage or amount or coupon",
  }),

  shipping_charges: Joi.number().min(0),

  currency: Joi.string(),
  offline_address: Joi.string().optional(),

  // New optional fields for updates
  status_note: Joi.string().optional().allow(null, ""),
  updated_by: Joi.string().optional().allow(null, ""),
  customer_name: Joi.string().optional().allow(null, ""),
  mobile_number: Joi.string().optional().allow(null, ""),
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
