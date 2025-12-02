import Joi from "joi";

export const productValidator = Joi.object({

    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    categories: Joi.string().required(),
    managedBy: Joi.string().required(),
    // status: Joi.string()
    //     .valid("pending", "approved", "rejected", "inactive")
    //     .required(),
    saleType: Joi.string()
        .valid("self", "sellForMe")
        .required(),
    commissionRate: Joi.number().required(),
    ownerId: Joi.string().required(),
    image: Joi.array().required(),
    stock: Joi.number().required(),
    tags: Joi.array().optional().allow(""),




})

export const productUpdateValidator = Joi.object({

    description: Joi.string().optional().allow(""),
    basePrice: Joi.number().optional().allow(""),
    tags: Joi.array().optional().allow(""),
    name: Joi.string().optional().allow(""),
    price: Joi.number().optional().allow(""),
    images: Joi.array().optional().allow(""),
    categories: Joi.string().optional().allow(""),
    stock: Joi.number().optional().allow(""),

})


// export const policyValidator = Joi.object({

//     title: Joi.string().required(),
//     content: Joi.string().required(),
//     type: Joi.string().required(),

// })