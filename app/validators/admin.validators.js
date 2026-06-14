import Joi from "joi";

// export const influencerValidators = Joi.object({
//     name: Joi.string().required(),
//     email: Joi.string().required(),
//     commissionRate: Joi.number().required(),
//     password: Joi.string().required(),
//     image: Joi.string().required(),
// })



export const policyValidator = Joi.object({

    title: Joi.string().required(),
    content: Joi.string().required(),
    type: Joi.string().required(),

})

// Validator

export const updateUserValidator = Joi.object({
    name: Joi.string().optional().allow(""),
    phone: Joi.number().optional(),
    address: Joi.string().optional().allow(""),
    image: Joi.string().optional().allow(""),
    // Admin-only fields (checked again in controller)
    role: Joi.string()
        .valid("buyer", "seller", "admin", "influencer")
        .optional(),
    status: Joi.string()
        .valid(
            "active",
            "inactive",
            "suspended",
            "rejected",
            "pending"
        )
        .optional(),

    isVerified: Joi.boolean().optional(),

    // Influencer-only fields
    commissionRate: Joi.number().optional(),
    campaigns_run: Joi.number().optional(),
    total_referrals: Joi.number().optional(),
    commission_earned: Joi.number().optional()

});

// Validator

export const adminCreateUserValidator = Joi.object({

    name: Joi.string().required(),

    email: Joi.string().email().required(),

    password: Joi.string().required(),

    role: Joi.string()
        .valid("admin", "influencer")
        .required(),

    imageUrl: Joi.string().required(),

    // influencer-only
    commissionRate: Joi.when("role", {
        is: "influencer",
        then: Joi.number().required(),
        otherwise: Joi.forbidden()
    })

});


// export const influencerValidators = Joi.object({

//     name: Joi.string().optional().allow(""),
//     role: Joi.string().optional().allow(""),
//     status: Joi.string().optional().allow(""),
//     // isVerified: Joi.string().optional().allow(""),

// })