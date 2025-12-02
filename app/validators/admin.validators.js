import Joi from "joi";

export const influencerValidators = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    commissionRate: Joi.number().required(),
    password: Joi.string().required(),
    image: Joi.string().required(),

})

export const statusValidator = Joi.object({
    status: Joi.string().required()
})


export const policyValidator = Joi.object({

    title: Joi.string().required(),
    content: Joi.string().required(),
    type: Joi.string().required(),

})

export const updateUserValidator = Joi.object({

    name: Joi.string().optional().allow(""),
    role: Joi.string().optional().allow(""),
    status: Joi.string().optional().allow(""),
    // isVerified: Joi.string().optional().allow(""),

})

// export const influencerValidators = Joi.object({

//     name: Joi.string().optional().allow(""),
//     role: Joi.string().optional().allow(""),
//     status: Joi.string().optional().allow(""),
//     // isVerified: Joi.string().optional().allow(""),

// })