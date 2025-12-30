import Joi from "joi";

const contactInfoSchema = Joi.object({
  email: Joi.string().email().optional().allow("", null).messages({
    "string.email": "Email must be a valid email address.",
    "string.base": "Email must be a string.",
  }),

  phone_number: Joi.string().optional().allow("", null).messages({
    "string.base": "Phone number must be a string.",
  }),

  address: Joi.string().optional().allow("", null).messages({
    "string.base": "Address must be a string.",
  }),

  instagram_link: Joi.string().uri().optional().allow("", null).messages({
    "string.uri": "Instagram link must be a valid URL.",
    "string.base": "Instagram link must be a string.",
  }),

  facebook_link: Joi.string().uri().optional().allow("", null).messages({
    "string.uri": "Facebook link must be a valid URL.",
    "string.base": "Facebook link must be a string.",
  }),

  twitter_link: Joi.string().uri().optional().allow("", null).messages({
    "string.uri": "Twitter link must be a valid URL.",
    "string.base": "Twitter link must be a string.",
  }),

  about_us: Joi.string().optional().allow("", null).messages({
    "string.base": "About Us must be a string.",
  }),

  terms_and_conditions: Joi.string().optional().allow("", null).messages({
    "string.base": "Terms and Conditions must be a string.",
  }),

  privacy_policy: Joi.string().optional().allow("", null).messages({
    "string.base": "Privacy Policy must be a string.",
  }),

  logo_image: Joi.object({
    original: Joi.string().optional().allow("", null),
    medium: Joi.string().optional().allow("", null),
    low: Joi.string().optional().allow("", null),
  })
    .optional()
    .allow(null),

  navbar_banner_text: Joi.string().optional().allow("", null).messages({
    "string.base": "Navbar banner text must be a string.",
  }),

  working_hours: Joi.string().optional().allow("", null).messages({
    "string.base": "Working hours must be a string.",
  }),

  invoice_template: Joi.string().optional().allow("", null).messages({
    "string.base": "Invoice template must be a string.",
  }),
  welcome_message: Joi.string().optional().allow("", null).messages({
    "string.base": "Welcome message must be a string.",
  }),
  business_name: Joi.string().optional().allow("", null).messages({
    "string.base": "Business name must be a string.",
  }),
});

function validateContactInfo(data) {
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      message: "Contact info data must be a valid object.",
      errors: [{ field: "", message: "Contact info data must be a valid object." }],
    };
  }

  const { error } = contactInfoSchema.validate(data, { abortEarly: false });

  if (error) {
    const formattedErrors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return {
      isValid: false,
      message: formattedErrors[0]?.message || "Invalid contact info data.",
      errors: formattedErrors,
    };
  }

  return {
    isValid: true,
    message: "Contact info data is valid.",
    errors: [],
  };
}

export default validateContactInfo;