import Joi from "joi";

const userAddressSchema = Joi.object({
  house_number: Joi.string().messages({
    "string.base": "House number must be a string.",
  }),
  street: Joi.string().messages({
    "string.base": "Street must be a string.",
  }),
  landmark: Joi.string().allow("", null).messages({
    "string.base": "Landmark must be a string.",
  }),
  city: Joi.string().messages({
    "string.base": "City must be a string.",
  }),
  district: Joi.string().messages({
    "string.base": "District must be a string.",
  }),
  state: Joi.string().messages({
    "string.base": "State must be a string.",
  }),
  postal_code: Joi.string().messages({
    "string.base": "Postal code must be a string.",
  }),
  country: Joi.string().messages({
    "string.base": "Country must be a string.",
  }),
});

const createUserSchema = Joi.object({
  username: Joi.string().trim().required().messages({
    "string.empty": "Username is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),

  phone_number: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
      "string.empty": "Phone number is required",
    }),

  branch_name: Joi.string().allow("", null),

  role: Joi.string()
    .valid("admin", "employee", "user")
    .messages({
      "any.only": "Invalid role selected",
    }),

  is_active: Joi.boolean(),

  image: Joi.string().allow("", null),

  address: Joi.array().items(userAddressSchema),
});

export function validateUserCreate(data) {
  const { error } = createUserSchema.validate(data, { abortEarly: false });

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
    message: "User create data is valid.",
    errors: [],
  };
}
