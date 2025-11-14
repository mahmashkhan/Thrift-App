import User from "../models/user.model.js";
import Influencer from "../models/influencer.model.js";
import catchAsync from "../utils/catchAsync.js";


const sendResponse = (res, data, code = "00", success = true) => {
    return res.status(200).json({
        code,
        successIndicator: success,
        data
    });
};


// ===========================================
// 1) GET /admin/users  (list users + filters)
// ===========================================
 const listUsers = catchAsync(async (req, res) => {
    const { role, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("-password");

    return sendResponse(res, {
        total,
        page: Number(page),
        users
    });
});


// ===========================================
// 2) GET /admin/users/:id (single user)
// ===========================================
 const getUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
        return sendResponse(res, { message: "User not found" }, "01", false);
    }

    return sendResponse(res, user);
});


// ===========================================
// 3) PUT /admin/users/:id  (update user)
// ===========================================
 const updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    const updates = req.body;

    const user = await User.findByIdAndUpdate(id, updates, {
        new: true
    }).select("-password");

    if (!user) {
        return sendResponse(res, { message: "User not found" }, "01", false);
    }

    return sendResponse(res, {
        message: "User updated successfully",
        user
    });
});


// ===========================================
// 4) DELETE /admin/users/:id (delete user)
// ===========================================
 const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        return sendResponse(res, { message: "User not found" }, "01", false);
    }

    return sendResponse(res, { message: "User deleted successfully" });
});


// ==================================================================
// 5) POST /admin/users/:id/status  (approve / reject user/influencer)
// ==================================================================
 const updateUserStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Check in both models
    let user = await User.findById(id);
    let isInfluencer = false;

    if (!user) {
        user = await Influencer.findById(id);
        isInfluencer = true;
    }

    if (!user) {
        return sendResponse(res, { message: "User not found" }, "01", false);
    }

    user.status = status;
    if (reason) user.reason = reason;
    await user.save();

    return sendResponse(res, {
        message: "User status updated",
        new_status: status
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


// ===================================================================
// 7) GET /admin/influencers/metrics/:id (metrics API)
// ===================================================================
 const getInfluencerMetrics = catchAsync(async (req, res) => {
    const { id } = req.params;

    const influencer = await Influencer.findById(id);
    if (!influencer) {
        return sendResponse(res, { message: "Influencer not found" }, "01", false);
    }

    return sendResponse(res, {
        campaigns_run: influencer.campaigns_run,
        total_referrals: influencer.total_referrals,
        commission_earned: influencer.commission_earned
    });
});

export {
    getInfluencerMetrics,
    // sellerRequests,
    updateUserStatus,
    deleteUser,
    updateUser,
    getUser,
    listUsers
}