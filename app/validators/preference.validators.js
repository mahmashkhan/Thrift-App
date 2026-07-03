import Joi from "joi";

export const setPreferencesValidator = Joi.object({
    brands: Joi.array().items(Joi.string().trim()).optional(),
    sizes: Joi.array().items(Joi.string().trim()).optional(),
    styles: Joi.array().items(Joi.string().trim()).optional(),
});

export const createPreferenceOptionValidator = Joi.object({
    type: Joi.string().valid("brand", "size", "style").required(),
    category: Joi.string().trim().required(),
    options: Joi.array().items(Joi.string().trim()).min(1).required(),
    order: Joi.number().integer().min(0).optional(),
});

export const updatePreferenceOptionValidator = Joi.object({
    category: Joi.string().trim().optional(),
    options: Joi.array().items(Joi.string().trim()).min(1).optional(),
    order: Joi.number().integer().min(0).optional(),
});
