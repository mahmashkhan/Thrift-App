import Joi from "joi";

export const productValidator = Joi.object({

    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    categories: Joi.string().required(),
    managedBy: Joi.string().required(),
    saleType: Joi.string().required(),
    commissionRate: Joi.number().required(),
    ownerId: Joi.string().required(),
    image: Joi.array().required(),
    stock: Joi.number().required()


})