import Joi from "joi";

export const addProductReviewValidator = Joi.object({
    productId: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500).optional().allow(""),
});

export const updateProductReviewValidator = Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().max(500).optional().allow(""),
});

export const addUserReviewValidator = Joi.object({
    sellerId: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500).optional().allow(""),
});

export const updateUserReviewValidator = Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().max(500).optional().allow(""),
});
