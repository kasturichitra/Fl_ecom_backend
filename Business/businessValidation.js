import Joi from "joi";

const businessDetailsSchema = Joi.object({
    user_id: Joi.string().required().messages({
        "string.empty": "User ID is required",
    }),
    gstinNumber: Joi.string()
        .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid GSTIN format",
            "string.empty": "GSTIN number is required",
        }),

    business_name: Joi.string().required().messages({
        "string.empty": "Business name is required",
    }),

    business_address: Joi.string().required().messages({
        "string.empty": "Business address is required",
    }),

    total_tax_paid: Joi.number().min(0).messages({
        "number.base": "Total tax paid must be a number",
        "number.min": "Total tax paid cannot be negative",
    }),

    current_year: Joi.number().integer().min(2000).max(2100).messages({
        "number.base": "Current year must be a number",
        "number.min": "Invalid year",
        "number.max": "Invalid year",
    }),
});

export function validateBusinessDetails(data) {
    const { error } = businessDetailsSchema.validate(data, { abortEarly: false });

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
        message: "Business details are valid.",
        errors: [],
    };
}
