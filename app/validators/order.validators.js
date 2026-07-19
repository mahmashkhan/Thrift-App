import Joi from "joi";

export const createBidValidator = Joi.object({
    productId:Joi.string().required(),
    priceOffered:Joi.number().required(),
    itemQuantity:Joi.number().required(),
})


export const orderInfluencerValidators = Joi.object({
    productId:Joi.string().required(),
    priceOffered:Joi.number().required(),
    itemQuantity:Joi.number().required(),
})

export const statusValidator = Joi.object({
    status: Joi.string().required()
})


export const policyValidator = Joi.object({

    title: Joi.string().required(),
    content: Joi.string().required(),
    type: Joi.string().required(),

})