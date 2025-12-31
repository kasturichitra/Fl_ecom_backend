import Joi from "joi";

/**
 * FAQ CREATION VALIDATION
 *
 * Rules enforced here:
 * 1. root FAQs cannot have a parent
 * 2. followup & leaf FAQs MUST have a parent
 * 3. leaf FAQs MUST have an answer
 * 4. followup FAQs CANNOT allow escalation
 * 5. root FAQs SHOULD NOT have answers
 * 6. Admin cannot manually control next_questions
 */

const createFaqSchema = Joi.object({
  // ❓ Question text is mandatory for all FAQ types
  question_text: Joi.string().trim().min(3).required().messages({
    "string.base": "Question text must be a string.",
    "string.min": "Question text must be at least 3 characters.",
    "any.required": "Question text is required.",
  }),

  // 📝 Answer text
  // - REQUIRED only for leaf FAQs
  // - NOT allowed for root FAQs
  answer_text: Joi.string()
    .trim()
    .allow("", null)
    .when("type", {
      is: "leaf",
      then: Joi.required().messages({
        "any.required": "Leaf FAQ must have an answer.",
      }),
      otherwise: Joi.optional(),
    }),

  // 📂 High-level classification
  issue_type: Joi.string()
    .valid("order", "payment", "delivery", "returns", "account", "general")
    .required()
    .messages({
      "any.only":
        "Issue type must be one of order, payment, delivery, returns, account, general.",
      "any.required": "Issue type is required.",
    }),

  // 🌳 FAQ type controls hierarchy behavior
  type: Joi.string()
    .valid("root", "followup", "leaf")
    .required()
    .messages({
      "any.only": "Type must be one of root, followup, leaf.",
      "any.required": "FAQ type is required.",
    }),

  // 🔗 Parent question logic
  parent_question_id: Joi.string()
    .allow(null)
    .when("type", {
      is: "root",
      then: Joi.valid(null).messages({
        "any.only": "Root FAQ cannot have a parent.",
      }),
      otherwise: Joi.required().messages({
        "any.required": "Followup and leaf FAQs must have a parent.",
      }),
    }),

  // 🚨 Escalation logic
  escalation_allowed: Joi.boolean()
    .when("type", {
      is: "leaf",
      then: Joi.optional(),
      otherwise: Joi.valid(false).messages({
        "any.only": "Only leaf FAQs can allow escalation.",
      }),
    }),

  escalation_label: Joi.string()
    .trim()
    .allow("", null)
    .optional(),

  // 🔢 Display order (lower = higher priority)
  priority: Joi.number().integer().min(0).optional(),

  // 🔍 Optional refinement
  sub_category: Joi.string().trim().allow("", null).optional(),

  // 🏷️ Optional search tags
  keywords: Joi.array()
    .items(Joi.string().trim())
    .optional(),

  // 🚫 These must NOT be set by admin during creation
  next_questions: Joi.forbidden(),
  question_id: Joi.forbidden(),
  created_by: Joi.forbidden(),
  is_active: Joi.forbidden(),
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
