import jwt from "jsonwebtoken";
import AppError from "./AppError.js";
import { successResponse } from "./common/responseObject.js";
import { User } from "../models/user.model.js";

const providerFields = {
    google: "googleId",
    facebook: "facebookId",
    apple: "appleId",
};

export const loginOrCreateSocialUser = async ({
    provider,
    payload,
    res,
    next,
}) => {


    const providerField = providerFields[provider];

    if (!providerField) {
        return next(new AppError("Unsupported social provider.", 400));
    }

    const {
        sub,
        email,
        email_verified,
        name,
        picture,
    } = payload;

    if (!email_verified) {
        return next(new AppError("Email is not verified.", 401));
    }

    let user = await User.findOne({ email });

    if (!user) {



        const userData = {
            name,
            email,
            imageUrl: picture,
            roles: ["buyer"],
            isVerified: true,
        };

        userData[providerField] = sub;

        user = await User.create(userData);


    } else {

        let shouldSave = false;

        if (!user[providerField]) {
            user[providerField] = sub;
            shouldSave = true;
        }

        if (!user.imageUrl && picture) {
            user.imageUrl = picture;
            shouldSave = true;
        }

        if (shouldSave) {
            await user.save();
        }


    }

    const accessToken = jwt.sign(
        {
            id: user._id,
            email: user.email,
            roles: user.roles,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );

    return successResponse(res, 200, {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        token: accessToken
    });
};