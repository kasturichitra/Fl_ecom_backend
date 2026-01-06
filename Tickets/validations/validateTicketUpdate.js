import Joi from "joi";

const updateTicketSchema = Joi.object({
  // 📊 Status updates
  status: Joi.string().valid("pending", "assigned", "in_progress", "resolved").optional().messages({
    "any.only": "Status must be one of pending, assigned, in_progress, resolved.",
  }),

  // 👨‍💼 Assignment
  assigned_to: Joi.string().trim().hex().length(24).allow(null).optional().messages({
    "string.hex": "Assigned To must be a valid ObjectId.",
    "string.length": "Assigned To must be 24 characters long.",
  }),

  assigned_at: Joi.date().optional(),

  // 📝 Message update
  message: Joi.string().trim().min(3).optional().messages({
    "string.base": "Message must be a string.",
    "string.min": "Message must be at least 3 characters.",
  }),

  // 👤 Admin actions - Resolution
  resolved_by: Joi.string().trim().hex().length(24).allow(null).optional().messages({
    "string.hex": "Resolved By must be a valid ObjectId.",
    "string.length": "Resolved By must be 24 characters long.",
  }),

  resolved_at: Joi.date().optional(),

  // 📧 Email
  user_email: Joi.string().email().optional(),

  // 🆔 Identity (Allowed)
  ticket_id: Joi.string().trim().optional(),

  raised_by: Joi.string().trim().hex().length(24).optional().messages({
    "string.hex": "Raised By must be a valid ObjectId.",
    "string.length": "Raised By must be 24 characters long.",
  }),

  // 🔗 FAQ Link (Allowed if updating)
  faq_question_id: Joi.string().trim().optional(),
  faq_path: Joi.array().items(Joi.string().trim()).optional(),
});

export function validateTicketUpdate(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "Ticket update data must be a valid object.",
      errors: [{ field: "", message: "Ticket update data must be a valid object." }],
    };
  }

  const { error } = updateTicketSchema.validate(data, { abortEarly: false });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid ticket update data.",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "Ticket update data is valid.",
    errors: [],
  };
}
