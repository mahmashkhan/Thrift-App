import { Seller, User } from '../models/user.model.js';
import OTP from '../models/otpModel.js'
import UserReview from '../models/user.review.model.js';
import AppError from "../utils/AppError.js";
import bcrypt from 'bcrypt';
import otpStore from '../utils/otpStore.js';
import dotenv from "dotenv";
import catchAsync from '../utils/catchAsync.js';
import { generateAndStoreOtp, sendOtpEmail } from '../config/email.service.js';
import { signToken } from '../config/jwt.handle.js';
import { sanitizeResponse } from '../utils/common/sanitizeResponse.js';
import { errorResponse, successResponse } from '../utils/common/responseObject.js';
import Order from '../models/order.model.js';
import { googleClient } from '../utils/googleClient.js';
import { loginOrCreateSocialUser } from '../utils/socialAuth.js';
import axios from 'axios';
import { verifyAppleToken } from '../utils/apple.js';
dotenv.config();

const signupUser = catchAsync(async (req, res, next) => {

    const {
        name,
        email,
        password,
        phone,
        imageUrl
    } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
        return next(
            new AppError("User already exists", 409)
        );
    }

    const otp = await generateAndStoreOtp({

        name,

        email,

        password,

        phone,

        imageUrl,

        roles: ["buyer"]

    });

    await sendOtpEmail({

        name,

        email,

        otp

    });


    successResponse(res, 200, {

        message: "OTP sent to your email"

    });

});


const resendOtp = catchAsync(async (req, res, next) => {

    const { email } = req.body;

    const otpRecord = otpStore.get(email);

    if (!otpRecord) {
        return next(
            new AppError("No pending signup found. Please signup first.", 404)
        );
    }

    const otp = await generateAndStoreOtp({
        name: otpRecord.name,
        email: otpRecord.email,
        password: otpRecord.password,
        phone: otpRecord.phone,
        imageUrl: otpRecord.imageUrl,
        roles: otpRecord.roles
    });

    await sendOtpEmail({
        name: otpRecord.name,
        email,
        otp
    });

    successResponse(res, 200, {
        message: "OTP resent successfully."
    });

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

    if (otpData.otp !== otp)
        return next(
            new AppError("Invalid OTP", 400)
        );

    if (otpData.otpExpiry < Date.now())
        return next(
            new AppError("OTP expired", 400)
        );

    const hashedPassword = await bcrypt.hash(otpData?.password, 10);

    // Create user
    const newUser = new User({
        name: otpData?.name,
        email: email,
        password: hashedPassword,
        phone: otpData?.phone,
        image: otpData?.image,
        roles: ['buyer'],
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
            roles: user.roles,
            token
        },

    });
});

const logOut = catchAsync(async (req, res) => {
    // delete refresh token from DB
    await RefreshToken.deleteOne({ token: req.body.refreshToken });

    res.json({ message: "Logged out successfully" });
})


const googleLogin = catchAsync(async (req, res, next) => {
    const { token } = req.body;

    if (!token) {
        return next(new AppError("Google token is required", 400));
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return loginOrCreateSocialUser({
        provider: "google",
        payload,
        res,
        next,
    });
});


const facebookLogin = catchAsync(async (req, res, next) => {
    const { accessToken } = req.body;
    if (!accessToken) {
        return next(new AppError("Facebook access token is required.", 400));
    }

    const { data } = await axios.get(
        "https://graph.facebook.com/me",
        {
            params: {
                fields: "id,name,email,picture",
                access_token: accessToken,
            },
        }
    );

    const payload = {
        sub: data.id,
        email: data.email,
        email_verified: true,
        name: data.name,
        picture: data.picture?.data?.url,
    };

    return loginOrCreateSocialUser({
        provider: "facebook",
        payload,
        res,
        next,
    });

});


const appleLogin = catchAsync(async (req, res, next) => {
    const { identityToken } = req.body;

    if (!identityToken) {
        return next(
            new AppError("Apple identity token is required", 400)
        );
    }

    // 1. Verify Apple JWT
    const applePayload = await verifyAppleToken(
        identityToken
    );

    /*
        Apple payload example:

        {
          iss: "https://appleid.apple.com",
          aud: "com.example.app",
          sub: "001234.abcd...",
          email: "user@gmail.com",
          email_verified: "true",
          is_private_email: "true",
          exp: 1234567890
        }

    */

    // 2. Normalize Apple payload
    const payload = {
        sub: applePayload.sub,
        email: applePayload.email,
        email_verified: applePayload.email_verified === "true" || applePayload.email_verified === true,
        name: null,
        picture: null,
    };

    // 3. Reuse common social login logic
    return loginOrCreateSocialUser({
        provider: "apple",
        payload,
        res,
        next,
    });
});

//Forgot Password - Send OTP to email
const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 400));
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError("No user found with this email", 404));
    }

    // Generate & store OTP
    const otp = await generateAndStoreOtp({
        email,
        type: "passwordReset" // To differentiate from signup OTP
    });

    // Send OTP email
    await sendOtpEmail({
        name: user.name,
        email,
        otp
    });

    successResponse(res, 200, {
        message: "OTP sent to your email"
    });
});


// Reset Password - Verify OTP and update password
const updateForgottenPass = catchAsync(async (req, res, next) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        return next(new AppError("Passwords do not match", 400));
    }

    // Check password strength (optional but recommended)
    if (newPassword.length < 8) {
        return next(new AppError("Password must be at least 8 characters long", 400));
    }

    // Verify OTP
    const otpData = otpStore.get(email);

    if (!otpData) {
        return next(new AppError("No OTP request found. Please request OTP again", 404));
    }

    if (otpData.otp !== otp) {
        return next(new AppError("Invalid OTP", 400));
    }

    if (otpData.otpExpiry < Date.now()) {
        otpStore.delete(email);
        return next(new AppError("OTP expired. Please request a new one", 400));
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Remove OTP from memory
    otpStore.delete(email);

    successResponse(res, 200, {
        message: "Password reset successfully"
    });
});

const changePassword = catchAsync(async (req, res, next) => {

    const userId = req.user.id;

    const {
        currentPassword,
        newPassword,
        confirmPassword
    } = req.body;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        return next(new AppError("Current password is incorrect", 400));
    }

    // Check new password confirmation
    if (newPassword !== confirmPassword) {
        return next(new AppError("Passwords do not match", 400));
    }

    // Prevent using the same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
        return next(
            new AppError(
                "New password must be different from the current password",
                400
            )
        );
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    successResponse(res, 200, {
        message: "Password changed successfully."
    });

});




const createSellerProfile = catchAsync(async (req, res, next) => {

    const userId = req.user.id;

    const {
        dateOfBirth,
        location,
        addressLine1,
        paypalEmail
    } = req.body;

    // Check user exists
    const user = await User.findById(userId);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Check if seller profile already exists
    const existingProfile = await Seller.findOne({ userId });

    if (existingProfile) {
        return next(
            new AppError("Seller profile already exists", 409)
        );
    }

    // Create seller profile
    const sellerProfile = await Seller.create({
        userId,
        dateOfBirth,
        location,
        addressLine1,
        paypalEmail,
        status: "approved"
    });

    // Add seller role if not already present
    await User.findByIdAndUpdate(userId, {
        $addToSet: {
            roles: "seller"
        }
    });

    successResponse(res, 201, sanitizeResponse(sellerProfile));

});

const getSellerProfile = catchAsync(async (req, res, next) => {

    const { userId } = req.params;

    const seller = await Seller.findOne({ userId })
        .populate("userId", "name email phone image roles status");

    if (!seller) {
        return next(new AppError("Seller profile not found", 404));
    }

    successResponse(res, 200, sanitizeResponse(seller));

});


const updateSellerProfile = catchAsync(async (req, res, next) => {

    const { userId } = req.params;

    // Seller can only update himself
    if (
        !req.user.roles.includes("admin") &&
        req.user.id !== userId
    ) {
        return next(
            new AppError("You are not authorized to update this seller profile.", 403)
        );
    }

    const seller = await Seller.findOne({ userId });

    if (!seller) {
        return next(new AppError("Seller profile not found", 404));
    }

    const {
        dateOfBirth,
        location,
        addressLine1,
        paypalEmail
    } = req.body;

    if (dateOfBirth !== undefined)
        seller.dateOfBirth = dateOfBirth;

    if (location !== undefined)
        seller.location = location;

    if (addressLine1 !== undefined)
        seller.addressLine1 = addressLine1;

    if (paypalEmail !== undefined)
        seller.paypalEmail = paypalEmail;

    await seller.save();

    successResponse(res, 200, sanitizeResponse(seller));

});


const deleteSellerProfile = catchAsync(async (req, res, next) => {

    const { userId } = req.params;

    if (
        !req.user.roles.includes("admin") &&
        req.user.id !== userId
    ) {
        return next(
            new AppError("You are not authorized to delete this seller profile.", 403)
        );
    }

    const seller = await Seller.findOne({ userId });

    if (!seller) {
        return next(new AppError("Seller profile not found", 404));
    }

    seller.status = "inactive";

    await seller.save();

    await User.findByIdAndUpdate(userId, {
        $pull: {
            roles: "seller"
        }
    });

    res.status(201).json({
        responseCode: "00",
        status: "success",
        message: "Seller profile deleted successfully.",
    });

});

const addUserReview = catchAsync(async (req, res, next) => {
    const revieweeId = req.params.revieweeId;
    const { orderId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (revieweeId === reviewerId) {
        return next(new AppError("You cannot review yourself", 400));
    }

    const seller = await User.findById(revieweeId);
    if (!seller) {
        return next(new AppError("User not found", 404));
    }

    const relevantOrder = await Order.findOne({ _id: orderId, buyerId: reviewerId });

    if (!relevantOrder || relevantOrder?.status !== 'completed') {
        return next(new AppError("No Completed Order Found", 404));
    }

    console.log("SELLERRRR ROLE", seller?.roles)


    if (!seller.roles.some(role => ["seller", "influencer"].includes(role))) {
        return next(new AppError("You can only review sellers or influencers", 400));
    }

    const existingReview = await UserReview.findOne({ revieweeId, reviewerId });
    if (existingReview) {
        return next(new AppError("You have already reviewed this user", 400));
    }

    await UserReview.create({ revieweeId, reviewerId, rating, comment });

    const stats = await UserReview.aggregate([
        { $match: { revieweeId: seller._id } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const averageRating = Math.round(stats[0].avgRating * 10) / 10;
    const totalReviews = stats[0].count;

    await User.findByIdAndUpdate(revieweeId, {
        averageRating,
        totalReviews,
    });

    res.status(201).json({
        responseCode: "00",
        status: "success",
        message: "Review added successfully",
        data: {
            averageRating,
            totalReviews,
        }
    });
});


const getUserReviews = catchAsync(async (req, res, next) => {
    const { revieweeId } = req.params;

    const reviewee = await User.findById(revieweeId).select("averageRating totalReviews name");
    if (!reviewee) {
        return next(new AppError("User not found", 404));
    }

    const reviews = await UserReview.find({ revieweeId })
        .populate("reviewerId", "name image")
        .sort({ createdAt: -1 });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        averageRating: reviewee.averageRating,
        totalReviews: reviewee.totalReviews,
        data: sanitizeResponse(reviews),
    });
});

const updateUserReview = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

    const review = await UserReview.findOne({ _id: req.params.reviewId, reviewerId });
    if (!review) {
        return next(new AppError("Review not found", 404));
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    const stats = await UserReview.aggregate([
        { $match: { revieweeId: review.revieweeId } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const averageRating = Math.round(stats[0].avgRating * 10) / 10;
    const totalReviews = stats[0].count;

    await User.findByIdAndUpdate(review.revieweeId, {
        averageRating,
        totalReviews,
    });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Review updated successfully",
    });
});

const deleteUserReview = catchAsync(async (req, res, next) => {
    const reviewerId = req.user.id;

    const review = await UserReview.findOne({ _id: req.params.reviewId, reviewerId });
    if (!review) {
        return next(new AppError("Review not found", 404));
    }

    const sellerId = review.revieweeId;
    await review.deleteOne();

    const stats = await UserReview.aggregate([
        { $match: { sellerId } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const averageRating = stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const totalReviews = stats.length ? stats[0].count : 0;

    await User.findByIdAndUpdate(sellerId, {
        averageRating,
        totalReviews
    });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Review deleted successfully",
    });
});

export {
    signupUser,
    googleLogin,
    facebookLogin,
    appleLogin,
    loginUser,
    verifyOTP,
    resendOtp,
    logOut,
    updateForgottenPass,
    forgotPassword,
    changePassword,
    addUserReview,
    getUserReviews,
    updateUserReview,
    deleteUserReview,
    createSellerProfile,
    getSellerProfile,
    updateSellerProfile,
    deleteSellerProfile
}
