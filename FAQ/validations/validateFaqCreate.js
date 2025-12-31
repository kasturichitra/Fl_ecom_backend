import Joi from "joi";

const createFaqSchema = Joi.object({
  question_id: Joi.string().required().messages({
    "string.base": "Question ID must be a string.",
    "any.required": "Question ID is required.",
  }),

  question_text: Joi.string().required().trim().messages({
    "string.base": "Question text must be a string.",
    "any.required": "Question text is required.",
  }),

  answer_text: Joi.string().optional().allow("", null).trim().messages({
    "string.base": "Answer text must be a string.",
  }),

  issue_type: Joi.string().valid("order", "payment", "delivery", "returns", "account", "general").required().messages({
    "string.base": "Issue type must be a string.",
    "any.only": "Issue type must be one of: order, payment, delivery, returns, account, general.",
    "any.required": "Issue type is required.",
  }),

  type: Joi.string().valid("root", "followup", "leaf").required().messages({
    "string.base": "Type must be a string.",
    "any.only": "Type must be one of: root, followup, leaf.",
    "any.required": "Type is required.",
  }),

  sub_category: Joi.string().optional().allow("", null).trim().messages({
    "string.base": "Sub category must be a string.",
  }),

  parent_question_id: Joi.string().optional().allow(null).messages({
    "string.base": "Parent question ID must be a string.",
  }),

  next_questions: Joi.array().items(Joi.string()).optional().allow(null).messages({
    "array.base": "Next questions must be an array of strings.",
  }),

  escalation_allowed: Joi.boolean().optional().messages({
    "boolean.base": "Escalation allowed must be a boolean.",
  }),

  escalation_label: Joi.string().optional().allow("", null).messages({
    "string.base": "Escalation label must be a string.",
  }),

  priority: Joi.number().integer().optional().messages({
    "number.base": "Priority must be a number.",
  }),

  keywords: Joi.array().items(Joi.string()).optional().allow(null).messages({
    "array.base": "Keywords must be an array of strings.",
  }),

  created_by: Joi.string().valid("system", "admin").optional().messages({
    "string.base": "Created by must be a string.",
    "any.only": "Created by must be either system or admin.",
  }),

  is_active: Joi.boolean().optional().messages({
    "boolean.base": "Is active must be a boolean.",
  }),
});

export function validateFaqCreate(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "FAQ data must be a valid object.",
      errors: [{ field: "", message: "FAQ data must be a valid object." }],
    };
  }

  const { error } = createFaqSchema.validate(data, { abortEarly: false });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid FAQ data.",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "FAQ data is valid.",
    errors: [],
  };
}
