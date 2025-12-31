import Joi from "joi";

/**
 * FAQ UPDATE VALIDATION
 *
 * Update rules:
 * 1. Hierarchy & identity fields are FORBIDDEN
 * 2. Only leaf FAQs can allow escalation
 * 3. Leaf FAQs must have an answer
 * 4. Root FAQs should not have answers
 */

const updateFaqSchema = Joi.object({
  // ✅ Editable fields
  question_text: Joi.string().trim().min(3).optional().messages({
    "string.base": "Question text must be a string.",
    "string.min": "Question text must be at least 3 characters.",
  }),

  answer_text: Joi.string().trim().allow("", null).optional().messages({
    "string.base": "Answer text must be a string.",
  }),

  escalation_allowed: Joi.boolean().optional().messages({
    "boolean.base": "Escalation allowed must be a boolean.",
  }),

  escalation_label: Joi.string().trim().allow("", null).optional().messages({
    "string.base": "Escalation label must be a string.",
  }),

  priority: Joi.number().integer().min(0).optional().messages({
    "number.base": "Priority must be a number.",
  }),

  keywords: Joi.array().items(Joi.string().trim()).optional().messages({
    "array.base": "Keywords must be an array of strings.",
  }),

  is_active: Joi.boolean().optional().messages({
    "boolean.base": "Is active must be a boolean.",
  }),

  // 🚫 FORBIDDEN fields (hard rules)
  question_id: Joi.forbidden(),
  issue_type: Joi.forbidden(),
  type: Joi.forbidden(),
  parent_question_id: Joi.forbidden(),
  next_questions: Joi.forbidden(),
  created_by: Joi.forbidden(),
});

export function validateFaqUpdate(data, existingFaq) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "FAQ update data must be a valid object.",
      errors: [{ field: "", message: "FAQ update data must be a valid object." }],
    };
  }

  const { error } = updateFaqSchema.validate(data, { abortEarly: false });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid FAQ update data.",
      errors: formattedErrors,
    };
  }

  /* ---------------- CONDITIONAL RULES ---------------- */

  // 1️⃣ Leaf FAQs must have an answer
  if (existingFaq.type === "leaf" && "answer_text" in data && !data.answer_text) {
    return {
      isValid: false,
      message: "Leaf FAQ must have an answer.",
      errors: [{ field: "answer_text", message: "Leaf FAQ must have an answer." }],
    };
  }

  // 2️⃣ Non-leaf FAQs cannot allow escalation
  if (existingFaq.type !== "leaf" && data.escalation_allowed === true) {
    return {
      isValid: false,
      message: "Only leaf FAQs can allow escalation.",
      errors: [
        {
          field: "escalation_allowed",
          message: "Only leaf FAQs can allow escalation.",
        },
      ],
    };
  }

  return {
    isValid: true,
    message: "FAQ update data is valid.",
    errors: [],
  };
}
