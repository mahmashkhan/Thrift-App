import Joi from "joi";

export const loginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const signupValidator = Joi.object({

    name: Joi.string().required(),

    email: Joi.string().email().required(),

    password: Joi.string().required(),

    phone: Joi.string()
        .length(11)
        .optional()
        .allow(""),

    imageUrl: Joi.string()
        .optional()
        .allow("")
});

export const resendOtpValidator = Joi.object({
    email: Joi.string().email().required()
});

export const sellerProfileValidator = Joi.object({

    dateOfBirth: Joi.date().required(),

    location: Joi.string().required(),

    addressLine1: Joi.string().required(),

    paypalEmail: Joi.string()
        .email()
        .required()

});

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

export const resetForgottenPassValidator = Joi.object({
    email: Joi.string().required().allow(""),
    otp: Joi.string().required().allow(""),
    newPassword: Joi.string().required().allow(""),
    confirmPassword: Joi.string().required().allow("")
})

export const changePasswordValidator = Joi.object({
    currentPassword: Joi.string().required().allow(""),
    newPassword: Joi.string().required().allow(""),
    confirmPassword: Joi.string().required().allow("")
})

