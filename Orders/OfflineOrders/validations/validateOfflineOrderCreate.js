import Joi from "joi";

const transactionSchema = Joi.object({
  payment_method: Joi.string().trim().required().messages({
    "string.base": "Payment method must be a string.",
    "any.required": "Payment method is required.",
  }),

  transaction_id: Joi.when("payment_method", {
    is: "CASH",
    then: Joi.string().trim().allow(null, "").optional(),
    otherwise: Joi.string().trim().required().messages({
      "string.base": "Transaction ID must be a string for digital payments.",
      "string.empty": "Transaction ID cannot be empty for digital payments.",
      "any.required": "Transaction ID is required for digital payments.",
    }),
  }),

  amount: Joi.number().min(0).required().messages({
    "number.base": "Amount must be a number.",
    "number.min": "Amount cannot be negative.",
    "any.required": "Amount is required.",
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

  // Unit-level pricing
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
    "number.min": "Unit tax percentage cannot be negative.",
  }),
  unit_final_price: Joi.number().min(0).required().messages({
    "any.required": "Unit final price is required.",
    "number.base": "Unit final price must be a number.",
    "number.min": "Unit final price cannot be negative.",
  }),

  // Total-level pricing
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

export const offlineOrderValidationSchema = Joi.object({
  order_id: Joi.string().trim().required().messages({
    "string.base": "Order ID must be a string.",
    "any.required": "Order ID is required.",
  }),

  customer_id: Joi.string().trim().required().messages({
    "string.base": "Customer ID must be a string.",
    "any.required": "Customer ID is required.",
  }),

  // Optional customer details locally in validation, although model doesn't enforce strictly but good to have if sent
  // The model had commented out customer_name/mobile_number, but customer_id is required.
  // We assume customer_id links to a User or Customer model.

  order_products: Joi.array().items(orderProductSchema).min(1).required().messages({
    "array.base": "Order products must be an array.",
    "array.min": "At least one product is required.",
    "any.required": "Order products are required.",
  }),

  base_price: Joi.number().min(0).required().messages({
    "number.base": "Base price must be a number.",
    "number.min": "Base price cannot be negative.",
    "any.required": "Base price is required.",
  }),

  gross_price: Joi.number().min(0).required().messages({
    "number.base": "Gross price must be a number.",
    "number.min": "Gross price cannot be negative.",
    "any.required": "Gross price is required.",
  }),

  tax_value: Joi.number().min(0).default(0).messages({
    "number.base": "Tax value must be a number.",
    "number.min": "Tax value cannot be negative.",
  }),

  discount_price: Joi.number().min(0).default(0).messages({
    "number.base": "Discount price must be a number.",
    "number.min": "Discount price cannot be negative.",
  }),

  total_amount: Joi.number().min(0).required().messages({
    "number.base": "Total amount must be a number.",
    "number.min": "Total amount cannot be negative.",
    "any.required": "Total amount is required.",
  }),

  additional_discount_percentage: Joi.number().min(0).default(0).messages({
    "number.base": "Additional discount percentage must be a number.",
    "number.min": "Additional discount percentage cannot be negative.",
  }),
  additional_discount_amount: Joi.number().min(0).default(0).messages({
    "number.base": "Additional discount amount must be a number.",
    "number.min": "Additional discount amount cannot be negative.",
  }),
  additional_discount_type: Joi.string().valid("percentage", "amount").optional().messages({
    "string.base": "Additional discount type must be a string.",
    "any.only": "Additional discount type must be percentage or amount.",
  }),

  // Transaction checks
  transactions: Joi.array().items(transactionSchema).optional().messages({
    "array.base": "Transactions must be an array.",
  }),
});

export function validateOfflineOrderCreate(data) {
  const { error } = offlineOrderValidationSchema.validate(data, { abortEarly: false });

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

  return { isValid: true, message: "Offline order data is valid.", errors: [] };
}
