import User from "../models/user.model.js";
import Influencer from "../models/influencer.model.js";
import catchAsync from "../utils/catchAsync.js";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError.js";


<<<<<<< HEAD
=======
const sendResponse = (res, data, code = "00", success = true) => {
    return res.status(200).json({
        code,
        successIndicator: success,
        data
    });
};


>>>>>>> origin/recover-branch
// ------------------- CREATE Influencer -------------------
const createInfluencer = catchAsync(async (req, res, next) => {
    const { name, email, commissionRate, password } = req.body;
    const userExist = await Influencer.findOne({ email });

    if (userExist) {
        return next(new AppError("User already Exist", 409))
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Influencer.create({
        name,
        email,
        commissionRate,
<<<<<<< HEAD
        status: "active",
=======
        status: "active", 
>>>>>>> origin/recover-branch
        password: hashedPassword,
    });

    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: newUser
    });
});

// ------------------- UPDATE Influencer -------------------
const updateInfluencer = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const reqBody = req.body;

    console.log("This is the body", reqBody)

    const updated = await Influencer.findByIdAndUpdate(
        id,
        { ...reqBody },
        { new: true }
    );

<<<<<<< HEAD

    if (!updated) {
        return next(new AppError('Influencer not found', 404))
=======
    console.log("Result Inf Update", updated)
    if (!updated) {
        return next(new AppError('Influencer not found', 304))
>>>>>>> origin/recover-branch
    }

    res.status(200).json({
        code: "00",
        successIndicator: 'success',
        data: updated
    });
});


// ------------------- GET All Influencers -------------------
const getInfluencers = catchAsync(async (req, res) => {
    const users = await Influencer.find();
    res.status(200).json({
        code: "00",
        successIndicator: "success",
        data: users
    });
});




// ------------------- GET Single Influencer -------------------
<<<<<<< HEAD
const getSinglInfluencer = catchAsync(async (req, res) => {
=======
const getSinglInfluencer = catchAsync(async (req, res,next) => {
>>>>>>> origin/recover-branch
    const { id } = req.params;

    const user = await Influencer.findById(id);

    if (!user) return next(new AppError("Influencer not found", 404));


    res.status(200).json({
        code: "00",
        successIndicator: 'success',
        data: user
    });
});

// Delete Influencer
const deleteInfluencer = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deleted = await Influencer.findByIdAndDelete(id);

    if (!deleted) return next(new AppError("Influencer not found", 404));

    res.status(200).json({
        code: "00",
        successIndicator: 'success',
        data: {
            message: "Influencer deleted successfully",
            deletedId: id
        }
    });
});

const listUsers = catchAsync(async (req, res) => {
    const { role, status, page = 1, limit = 10 } = req.query;

    console.log("Roleeee", role);

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
        data: users
    });
});


<<<<<<< HEAD
const getSingleUser = catchAsync(async (req, res, next) => {
=======
// ===========================================
// 2) GET /admin/users/:id (single user)
// ===========================================
const getSingleUser = catchAsync(async (req, res,next) => {
>>>>>>> origin/recover-branch
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) return next(new AppError("User not found", 404));


    res.status(200).json({
        code: "00",
        successIndicator: 'success',
        data: user
    });
});


<<<<<<< HEAD
const updateUser = catchAsync(async (req, res, next) => {
=======
// ===========================================
// 3) PUT /admin/users/:id  (update user)
// ===========================================
const updateUser = catchAsync(async (req, res,next) => {
>>>>>>> origin/recover-branch
    const { id } = req.params;

    const updates = req.body;

    const user = await User.findByIdAndUpdate(id, updates, {
        new: true
    }).select("-password");

    if (!user) return next(new AppError("User not found", 404));


    res.status(201).json({
        code: "00",
        successIndicator: 'success',
        data: user
    });
});


<<<<<<< HEAD
const deleteUser = catchAsync(async (req, res) => {
=======
// ===========================================
// 4) DELETE /admin/users/:id (delete user)
// ===========================================
const deleteUser = catchAsync(async (req, res,next) => {
>>>>>>> origin/recover-branch
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) return next(new AppError("User not found", 404));


    res.status(200).json({
        code: "00",
        successIndicator: 'success',
        data: user
    });
});


<<<<<<< HEAD
const updateUserStatus = catchAsync(async (req, res) => {
=======
const updateUserStatus = catchAsync(async (req, res,next) => {
>>>>>>> origin/recover-branch
    const { id } = req.params;
    const { status, reason } = req.body;

    // Check in both models
    let user = await User.findById(id);
    let isInfluencer = false;

    if (!user) {
        user = await Influencer.findById(id);
        isInfluencer = true;
    }

    if (!user) return next(new AppError("User not found", 404));


    user.status = status;
    if (reason) user.reason = reason;
    await user.save();

    res.status(201).json({
        code: "00",
        successIndicator: 'success',
        data: user
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


<<<<<<< HEAD
const getInfluencerMetrics = catchAsync(async (req, res, next) => {
=======
// ===================================================================
// 7) GET /admin/influencers/metrics/:id (metrics API)
// ===================================================================
const getInfluencerMetrics = catchAsync(async (req, res,next) => {
>>>>>>> origin/recover-branch
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
    createInfluencer,
    getInfluencerMetrics,
    getInfluencers,
    getSinglInfluencer,
    updateInfluencer,
    deleteInfluencer,

    updateUserStatus,
    deleteUser,
    updateUser,
    getSingleUser,
    listUsers
}