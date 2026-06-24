import Joi from "joi";

export const loginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const signupValidator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string()
        .valid("admin", "seller", "buyer")
        .required(),
    phone: Joi.string().length(11).optional().allow(""),
    address: Joi.string().optional().allow(""),
    imageUrl: Joi.string().optional().allow("")

})

export const otpValidator = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string()
        .length(4)
        .pattern(/^[0-9]{4}$/)
        .required()

})

export const editProfileValidator = Joi.object({
    name: Joi.string().optional().allow(""),
    password: Joi.string().optional().allow(""),
    imageUrl: Joi.string().optional().allow("")

}) 

