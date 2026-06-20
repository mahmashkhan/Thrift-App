import Joi from "joi";

export const conversationValidator = Joi.object({
    sellerId: Joi.string().required(),
    productId: Joi.string().optional()
})