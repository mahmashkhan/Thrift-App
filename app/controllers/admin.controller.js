import {Influencer, User} from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError.js";
import { sanitizeResponse } from "../utils/common/sanitizeResponse.js";
import { successResponse } from "../utils/common/responseObject.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";


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
        image: imageUrl,
        roles: role === "admin"
            ? ["admin"]
            : ["buyer", "influencer"],

        status: "active",
        isVerified: true
    };

    const newUser = await User.create(payload);

    // Create influencer profile
    if (role === "influencer") {

        await Influencer.create({
            userId: newUser._id,
            commissionRate,
            status: "approved"
        });

    }

    successResponse(res, 201, sanitizeResponse(newUser));

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


const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalInfluencers,

      activeUsers,
      inactiveUsers,
      suspendedUsers,
      verifiedUsers,

      totalProducts,
      approvedProducts,
      pendingProducts,
      rejectedProducts,
      inactiveProducts,
      outOfStockProducts,

      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,

      pendingPayments,
      paidPayments,
      failedPayments,
      refundedPayments,
      partiallyRefundedPayments,

      salesStats,
      influencerStats,
      settlementStats
    ] = await Promise.all([

      // =========================
      // USERS
      // =========================

      User.countDocuments(),

      User.countDocuments({
        roles: "buyer"
      }),

      User.countDocuments({
        roles: "seller"
      }),

      User.countDocuments({
        roles: "influencer"
      }),

      User.countDocuments({
        status: "active"
      }),

      User.countDocuments({
        status: "inactive"
      }),

      User.countDocuments({
        status: "suspended"
      }),

      User.countDocuments({
        isVerified: true
      }),


      // =========================
      // PRODUCTS
      // =========================

      Product.countDocuments(),

      Product.countDocuments({
        status: "approved"
      }),

      Product.countDocuments({
        status: "pending"
      }),

      Product.countDocuments({
        status: "rejected"
      }),

      Product.countDocuments({
        status: "inactive"
      }),

      Product.countDocuments({
        stock: { $lte: 0 }
      }),


      // =========================
      // ORDERS
      // =========================

      Order.countDocuments(),

      Order.countDocuments({
        status: "pending"
      }),

      Order.countDocuments({
        status: "confirmed"
      }),

      Order.countDocuments({
        status: "shipped"
      }),

      Order.countDocuments({
        status: "completed"
      }),

      Order.countDocuments({
        status: "cancelled"
      }),


      // =========================
      // PAYMENTS
      // =========================

      Order.countDocuments({
        paymentStatus: "PENDING"
      }),

      Order.countDocuments({
        paymentStatus: "PAID"
      }),

      Order.countDocuments({
        paymentStatus: "FAILED"
      }),

      Order.countDocuments({
        paymentStatus: "REFUNDED"
      }),

      Order.countDocuments({
        paymentStatus: "PARTIALLY_REFUNDED"
      }),


      // =========================
      // SALES
      // =========================

      Order.aggregate([
        {
          $match: {
            paymentStatus: {
              $in: ["PAID", "PARTIALLY_REFUNDED"]
            }
          }
        },
        {
          $group: {
            _id: null,

            grossSales: {
              $sum: "$totalCustomerPays"
            },

            platformRevenue: {
              $sum: "$platformFeesAmount"
            },

            sellerAmount: {
              $sum: "$totalSellerGets"
            },

            influencerCommission: {
              $sum: "$influencerCommissionAmount"
            },

            totalDeliveryFees: {
              $sum: "$deliveryFee"
            }
          }
        }
      ]),


      // =========================
      // INFLUENCER STATS
      // =========================

      Order.aggregate([
        {
          $match: {
            is_influencer_order: true,

            paymentStatus: {
              $in: ["PAID", "PARTIALLY_REFUNDED"]
            }
          }
        },
        {
          $group: {
            _id: null,

            ordersGenerated: {
              $sum: 1
            },

            salesGenerated: {
              $sum: "$totalCustomerPays"
            },

            commissionGenerated: {
              $sum: "$influencerCommissionAmount"
            }
          }
        }
      ]),


      // =========================
      // SELLER SETTLEMENT
      // =========================

      Order.aggregate([
        {
          $unwind: "$shipments"
        },
        {
          $group: {
            _id: "$shipments.settlementStatus",

            amount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$shipments.settlementStatus",
                      "SETTLED"
                    ]
                  },
                  "$totalSellerGets",
                  0
                ]
              }
            },

            count: {
              $sum: 1
            }
          }
        }
      ])
    ]);


    // =========================
    // SALES RESULT
    // =========================

    const sales = salesStats[0] || {
      grossSales: 0,
      platformRevenue: 0,
      sellerAmount: 0,
      influencerCommission: 0,
      totalDeliveryFees: 0
    };


    // =========================
    // INFLUENCER RESULT
    // =========================

    const influencer = influencerStats[0] || {
      ordersGenerated: 0,
      salesGenerated: 0,
      commissionGenerated: 0
    };


    // =========================
    // SETTLEMENT RESULT
    // =========================

    let pendingPayouts = 0;
    let readyPayouts = 0;
    let settledPayouts = 0;
    let failedPayouts = 0;
    let onHoldPayouts = 0;

    settlementStats.forEach((item) => {
      switch (item._id) {
        case "PENDING":
          pendingPayouts += item.count;
          break;

        case "READY":
          readyPayouts += item.count;
          break;

        case "SETTLED":
          settledPayouts += item.count;
          break;

        case "FAILED":
          failedPayouts += item.count;
          break;

        case "ON_HOLD":
          onHoldPayouts += item.count;
          break;
      }
    });


    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      responseCode: "00",
      status: "success",

      data: {

        // =====================
        // OVERVIEW
        // =====================

        overview: {
          totalUsers,
          totalBuyers,
          totalSellers,
          totalInfluencers,

          totalProducts,

          totalOrders
        },


        // =====================
        // USERS
        // =====================

        users: {
          total: totalUsers,

          buyers: totalBuyers,

          sellers: totalSellers,

          influencers: totalInfluencers,

          active: activeUsers,

          inactive: inactiveUsers,

          suspended: suspendedUsers,

          verified: verifiedUsers
        },


        // =====================
        // SALES
        // =====================

        sales: {
          grossSales: sales.grossSales || 0,

          platformRevenue: sales.platformRevenue || 0,

          sellerAmount: sales.sellerAmount || 0,

          influencerCommission:
            sales.influencerCommission || 0,

          deliveryFees:
            sales.totalDeliveryFees || 0
        },


        // =====================
        // ORDERS
        // =====================

        orders: {
          total: totalOrders,

          pending: pendingOrders,

          confirmed: confirmedOrders,

          shipped: shippedOrders,

          completed: completedOrders,

          cancelled: cancelledOrders
        },


        // =====================
        // PAYMENTS
        // =====================

        payments: {
          pending: pendingPayments,

          paid: paidPayments,

          failed: failedPayments,

          refunded: refundedPayments,

          partiallyRefunded: partiallyRefundedPayments
        },


        // =====================
        // PRODUCTS
        // =====================

        products: {
          total: totalProducts,

          approved: approvedProducts,

          pending: pendingProducts,

          rejected: rejectedProducts,

          inactive: inactiveProducts,

          outOfStock: outOfStockProducts
        },


        // =====================
        // INFLUENCERS
        // =====================

        influencers: {
          total: totalInfluencers,

          active: await User.countDocuments({
            roles: "influencer",
            status: "active"
          }),

          inactive: await User.countDocuments({
            roles: "influencer",
            status: {
              $ne: "active"
            }
          }),

          ordersGenerated:
            influencer.ordersGenerated || 0,

          salesGenerated:
            influencer.salesGenerated || 0,

          commissionGenerated:
            influencer.commissionGenerated || 0
        },


        // =====================
        // SELLER PAYOUTS
        // =====================

        sellerPayouts: {
          pending: pendingPayouts,

          ready: readyPayouts,

          settled: settledPayouts,

          failed: failedPayouts,

          onHold: onHoldPayouts
        }
      }
    });

  } catch (error) {
    next(error);
  }
};


export {
    getInfluencerMetrics,
    adminCreateUser,
    deleteUser,
    updateUser,
    getSingleUser,
    listUsers,
    getAdminStats
}