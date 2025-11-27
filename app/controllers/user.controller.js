import User from '../models/user.model.js';
import AppError from "../utils/AppError.js";
import bcrypt from 'bcrypt';
import otpStore from '../utils/otpStore.js';
import dotenv from "dotenv";
import catchAsync from '../utils/catchAsync.js';
import { generateAndStoreOtp, sendOtpEmail } from '../config/email.service.js';
import { signToken } from '../config/jwt.handle.js';
dotenv.config();



const createUser = catchAsync(async (req, res, next) => {
    const { name, email, password, role, phone, address,image } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
        return next(new AppError("User already Exist", 409))
    }

    // 2. Generate & store OTP in memory
    const otp = await generateAndStoreOtp({ name, email, password, role, phone, address,image });

    // 3. Send OTP email
    await sendOtpEmail({ name, email, otp });

    res.status(200).json({ message: "OTP sent to your email" });
});



const verifyOTP = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp)
        return res.status(400).json({ message: "Email and OTP are required" });

    const otpData = otpStore.get(email);
    console.log("Here is otpData", otpData)

    if (!otpData)
        return res.status(404).json({ message: "No OTP request found" });

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

    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: user
    });

});


// loginUser.js
const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
        return res.status(404).json({ message: "User not found or password missing" });
    }

    console.log("User", user.password);
    console.log("Raw", password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("isMatch====", isMatch)
    // console.log("Is Match is ==========>", isMatch);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = signToken({ id: user._id, role: user.role, email: user.email });

    res.status(200).json({
        status: "00",
        successIndicator: "success",
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




export { createUser, loginUser, verifyOTP,logOut }
