import Joi from "joi";

const createTicketSchema = Joi.object({
  // 📧 User email
  user_email: Joi.string().email().required().messages({
    "string.email": "User email must be a valid email address.",
    "any.required": "User email is required.",
  }),

  // 🔗 FAQ context
  faq_question_id: Joi.string().trim().required().messages({
    "string.base": "FAQ Question ID must be a string.",
    "any.required": "FAQ Question ID is required.",
  }),

  // 🛤️ FAQ path
  faq_path: Joi.array().items(Joi.string().trim()).default([]).optional().messages({
    "array.base": "FAQ path must be an array of strings.",
  }),

  // 📝 Message content
  message: Joi.string().trim().min(3).required().messages({
    "string.base": "Message must be a string.",
    "string.min": "Message must be at least 3 characters.",
    "any.required": "Message is required.",
  }),

  // 🆔 Identity & System Fields (Allowed)
  ticket_id: Joi.string().trim().optional(),
  order_id: Joi.string().trim().optional(),

  raised_by: Joi.string().trim().hex().length(24).optional().messages({
    "string.hex": "Raised By must be a valid ObjectId.",
    "string.length": "Raised By must be 24 characters long.",
  }),

  status: Joi.string().valid("pending", "assigned", "in_progress", "resolved").optional(),

  assigned_to: Joi.string().trim().hex().length(24).allow(null).optional(),
  assigned_at: Joi.date().optional(),

  resolved_by: Joi.string().trim().hex().length(24).allow(null).optional(),
  resolved_at: Joi.date().optional(),

  is_prohibited: Joi.boolean().optional(),

  relevant_images: Joi.array().items(Joi.any()).optional(), // Allow array of image objects
});

function validateTicketCreate(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "Ticket data must be a valid object.",
      errors: [{ field: "", message: "Ticket data must be a valid object." }],
    };
  }

  const { error } = createTicketSchema.validate(data, { abortEarly: false });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid ticket data.",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "Ticket data is valid.",
    errors: [],
  };
}

export default validateTicketCreate;
