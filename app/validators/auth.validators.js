import Joi from "joi";

export const loginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const signupValidator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
    phone: Joi.string().length(11).required(),
    address: Joi.string().required()

})