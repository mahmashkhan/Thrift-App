import Joi from "joi";

export const productValidator = Joi.object({
    title: Joi.string().optional().allow("", null),
    description: Joi.string().required(),
    price: Joi.number().required(),
    categories: Joi.array().optional().allow(""),
    managedBy: Joi.string().required(),
    managedById: Joi.string().optional().allow("", null),
    // status: Joi.string()
    //     .valid("pending", "approved", "rejected", "inactive")
    //     .required(),
    sellType: Joi.string()
        .valid("self", "sellForMe")
        .required(),
    commissionRate: Joi.number().required(),
    ownerId: Joi.string().required(),
    imageUrls: Joi.array().required(),
    stock: Joi.number().required(),
    tags: Joi.array().optional().allow(""),
    salePrice: Joi.number().required(),
    color: Joi.string().required(),
    details: Joi.string().required(),
    size: Joi.string().valid("XS", "S", "M", "L", "XL", "XXL", "Free Size").required(),
    brand: Joi.string().required(),
    condition: Joi.string().valid("New", "Like New", "Used", "Refurbished").required(),
    
})

export const productUpdateValidator = Joi.object({

    description: Joi.string().optional().allow(""),
    basePrice: Joi.number().optional().allow(""),
    tags: Joi.array().optional().allow(""),
    title: Joi.string().optional().allow(""),
    price: Joi.number().optional().allow(""),
    imageUrls: Joi.array().optional().allow(""),
    categories: Joi.array().optional().allow(""),
    stock: Joi.number().optional().allow(""),

})


// export const policyValidator = Joi.object({

//     title: Joi.string().required(),
//     content: Joi.string().required(),
//     type: Joi.string().required(),

// })