import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError.js";
import { sanitizeResponse } from "../utils/common/sanitizeResponse.js";


const listUsers = catchAsync(async (req, res) => {
    const { role, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("-password");

    res.status(200).json({
        code: "00",
        successIndicator: 'success',
        data: sanitizeResponse(users)
    });
});


const getSingleUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) return next(new AppError("User not found", 404));


    res.status(200).json({
        responseCode: "00",
        status: 'success',
        data: sanitizeResponse(user)
    });
});


// Controller

const updateUser = catchAsync(async (req, res, next) => {

    const { id } = req.params;

    const updates = { ...req.body };


    // Find target user
    const existingUser = await User.findById(id);

    if (!existingUser) {
        return next(
            new AppError("User not found", 404)
        );
    }

    // -----------------------------------------
    // AUTHORIZATION
    // -----------------------------------------

    const isAdmin = req.user.role === "admin";

    // Non-admin can only update themselves
    if (
        !isAdmin &&
        req.user._id.toString() !== id
    ) {
        return next(
            new AppError(
                "You are not allowed to update this user",
                403
            )
        );
    }

    // -----------------------------------------
    // RESTRICT ADMIN-ONLY FIELDS
    // -----------------------------------------

    // Non-admins cannot update these fields
    if (!isAdmin) {

        delete updates.role;
        delete updates.status;
        delete updates.isVerified;

        const influencerFields = [
            "commissionRate",
            "campaigns_run",
            "total_referrals",
            "commission_earned"
        ];

        // Only influencer/admin can update influencer fields
        if (existingUser.role !== "influencer" && !isAdmin) {
            influencerFields.forEach(field => {
                delete updates[field];
            });
        }
    }

    // -----------------------------------------
    // UPDATE USER
    // -----------------------------------------

    const updatedUser = await User.findByIdAndUpdate(
        id,
        updates,
        {
            new: true,
            runValidators: true
        }
    ).select("-password -__v");

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(updatedUser)
    });
});


// Controller

const adminCreateUser = catchAsync(async (req, res, next) => {

    const {
        name,
        email,
        password,
        role,
        imageUrl,
        commissionRate
    } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
        return next(
            new AppError("User already exists", 409)
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const payload = {
        name,
        email,
        password: hashedPassword,
        imageUrl,
        role,

        status: "active",
        isVerified: true
    };

    // Add influencer-only fields
    if (role === "influencer") {
        payload.commissionRate = commissionRate;
    }

    const newUser = await User.create(payload);

    return res.status(201).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(newUser)
    });
});

const deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) return next(new AppError("User not found", 404));


    res.status(200).json({
        responseCode: "00",
        status: 'success',
        message: "User Deleted Successfully"
    });
});




// ===================================================================
// 6) GET /admin/sellers/requests (pending seller registration requests)
// ===================================================================
//  const sellerRequests = catchAsync(async (req, res) => {
//     const requests = await User.find({ role: "seller", status: "pending" })
//         .select("-password");

//     return sendResponse(res, { requests });
// });


const getInfluencerMetrics = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const influencer = await Influencer.findById(id);
    if (!influencer) return next(new AppError("Influencer not found", 404));



    res.status(200).json({
        code: "00",
        successIndicator: 'success',
        data: {
            campaigns_run: influencer.campaigns_run,
            total_referrals: influencer.total_referrals,
            commission_earned: influencer.commission_earned
        }
    });
});

export {
    getInfluencerMetrics,
    adminCreateUser,
    deleteUser,
    updateUser,
    getSingleUser,
    listUsers
}