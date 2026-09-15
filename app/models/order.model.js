// import mongoose from "mongoose";

// const OrderSchema = new mongoose.Schema({
//     buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     items: [
//         {
//             productId: { type: String, ref: "Product" },
//             productOwner: { type: String, ref: "Product" },
//             quantity: { type: String, ref: "Product" },
//             price: Number,
//             bidId: { type: String, ref: "Bid", default: null }
//         }
//     ],
//     subtotal: Number,
//     deliveryFee: Number,
//     totalCustomerPays: Number,
//     platformCommissionPercent: Number,
//     platformCommissionAmount: Number,
//     influencerCommissionPercent: Number,
//     influencerCommissionAmount: Number,
//     totalSellerGets: Number,
//     shipping_type: { type: String, enum: ["self_selling", "sell_for_me"] },
//     is_influencer_order: Boolean,
//     status: { type: String, enum: ["pending", "confirmed", "shipped", "completed", "cancelled"], default: "pending" },
// }, { timestamps: true });

// const Order = mongoose.model("Order", OrderSchema);
// export default Order;




import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [
            {
                productId: {
                    type: String,
                    ref: "Product",
                    required: true
                },

                productOwner: {
                    type: String,
                    ref: "User",
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true
                },

                price: {
                    type: Number,
                    required: true
                },

                bidId: {
                    type: String,
                    ref: "Bid",
                    default: null
                },

                // Store the settlement calculated during checkout
                settlement: {
                    type: mongoose.Schema.Types.Mixed,
                    default: null
                },

                // Stripe connected account belonging to this seller
                sellerStripeAccountId: {
                    type: String,
                    default: null
                },

                // Stripe transfer created when seller is paid
                stripeTransferId: {
                    type: String,
                    default: null
                },

                // Individual settlement state
                settlementStatus: {
                    type: String,
                    enum: [
                        "PENDING",
                        "READY",
                        "ON_HOLD",
                        "SETTLED",
                        "FAILED"
                    ],
                    default: "PENDING"
                }
            }
        ],

        // Existing order amounts
        subtotal: {
            type: Number,
            required: true
        },

        deliveryFee: {
            type: Number,
            default: 0
        },

        totalCustomerPays: {
            type: Number,
            required: true
        },

        platformCommissionPercent: {
            type: Number,
            default: 20
        },

        platformCommissionAmount: {
            type: Number,
            default: 0
        },

        influencerCommissionPercent: {
            type: Number,
            default: 0
        },

        influencerCommissionAmount: {
            type: Number,
            default: 0
        },

        totalSellerGets: {
            type: Number,
            default: 0
        },

        shipping_type: {
            type: String,
            enum: ["self_selling", "sell_for_me"],
            default: "self_selling"
        },

        is_influencer_order: {
            type: Boolean,
            default: false
        },

        // -------------------------
        // Stripe
        // -------------------------

        stripePaymentIntentId: {
            type: String,
            default: null
        },

        paymentStatus: {
            type: String,
            enum: [
                "PENDING",
                "PAID",
                "FAILED",
                "REFUNDED",
                "PARTIALLY_REFUNDED"
            ],
            default: "PENDING"
        },

        // -------------------------
        // Delivery
        // -------------------------

        deliveryStatus: {
            type: String,
            enum: [
                "PENDING",
                "PICKUP_CREATED",
                "PICKED_UP",
                "IN_TRANSIT",
                "DELIVERED",
                "FAILED",
                "RETURNED",
                "CANCELLED"
            ],
            default: "PENDING"
        },

        // -------------------------
        // Buyer confirmation
        // -------------------------

        buyerConfirmationStatus: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "PROBLEM"
            ],
            default: "PENDING"
        },

        // -------------------------
        // Overall seller settlement
        // -------------------------

        settlementStatus: {
            type: String,
            enum: [
                "PENDING",
                "ON_HOLD",
                "READY",
                "SETTLED",
                "FAILED"
            ],
            default: "PENDING"
        },

        // -------------------------
        // Existing order status
        // -------------------------

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "shipped",
                "completed",
                "cancelled"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", OrderSchema);

export default Order;