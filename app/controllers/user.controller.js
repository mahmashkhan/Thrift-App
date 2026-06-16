import User from '../models/user.model.js';
import OTP from '../models/otpModel.js'
import AppError from "../utils/AppError.js";
import bcrypt from 'bcrypt';
import otpStore from '../utils/otpStore.js';
import dotenv from "dotenv";
import catchAsync from '../utils/catchAsync.js';
import { generateAndStoreOtp, sendOtpEmail } from '../config/email.service.js';
import { signToken } from '../config/jwt.handle.js';
import { sanitizeResponse } from '../utils/common/sanitizeResponse.js';
import { errorResponse, successResponse } from '../utils/common/responseObject.js';
dotenv.config();



const signupUser = catchAsync(async (req, res, next) => {
    const {
        name,
        email,
        password,
        role,
        phone,
        address,
        imageUrl
    } = req.body;

    // Only buyer/seller allowed from public signup
    if (!["buyer", "seller"].includes(role)) {
        return next(
            new AppError("Invalid role for signup", 400)
        );
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
        return next(
            new AppError("User already exists", 409)
        );
    }

    // Generate & store OTP
    const otp = await generateAndStoreOtp({
        name,
        email,
        password,
        role,
        phone,
        address,
        imageUrl
    });

    // Send OTP email
    await sendOtpEmail({
        name,
        email,
        otp
    });

    successResponse(res, 200, {
        message: "OTP sent to your email"
    })
    // return res.status(200).json();
});



const verifyOTP = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp)
        return res.status(400).json({ message: "Email and OTP are required" });

    const otpData = otpStore.get(email);
    console.log("Here is otpData", otpData)

    if (!otpData)
        errorResponse(res, 404, { message: "No OTP request found" })
    // return res.status(404).json({ message: "No OTP request found" });

    if (otpData.otp !== Number(otp))
        return res.status(400).json({ message: "Invalid OTP" });

    if (otpData.otpExpiry < Date.now())
        return res.status(400).json({ message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(otpData?.password, 10);

    // Create user
    const newUser = new User({
        name: otpData?.name,
        email: email,
        password: hashedPassword,
        role: otpData?.role,
        phone: otpData?.phone,
        address: otpData?.address,
        image: otpData?.image,
        isVerified: true
    });

    const user = await newUser.save();


    // Remove OTP from memory
    otpStore.delete(email);


    successResponse(res, 201, sanitizeResponse(user))

    // res.status(201).json({
    //     code: "00",
    //     successIndicator: "success",
    //     data: sanitizeResponse(user)
    // });

});


// loginUser.js
const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
        errorResponse(res, 404, { message: "User not found or password missing" })
        return
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        errorResponse(res, 400, { message: "Invalid email or password" })
        return
        // return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = signToken({ id: user._id, role: user.role, email: user.email });

    res.status(200).json({
        status: "success",
        responseCode: "00",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        },

    });
});

const logOut = catchAsync(async (req, res) => {
    // delete refresh token from DB
    await RefreshToken.deleteOne({ token: req.body.refreshToken });

    res.json({ message: "Logged out successfully" });
})

// const getAllUsers = catchAsync(async (req,res)=>{
// const users = await User.Find();
// res.status(200).json({
//     status: "00",
//     successIndicator: "success",
//     data: {
//         ...users
//     },})

// })




export { signupUser, loginUser, verifyOTP, logOut }
