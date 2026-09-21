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

        shipments: [
            {
                sellerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },

                sellerName: {
                    type: String,
                    required: true
                },

                items: [
                    {
                        productId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Product",
                            required: true
                        },

                        bidId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Bid",
                            default: null
                        },

                        quantity: {
                            type: Number,
                            required: true
                        },

                        price: {
                            type: Number,
                            required: true
                        },

                        settlement: {
                            type: mongoose.Schema.Types.Mixed,
                            default: null
                        },

                        sellerStripeAccountId: {
                            type: String,
                            default: null
                        },

                        stripeTransferId: {
                            type: String,
                            default: null
                        },

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

                subtotal: {
                    type: Number,
                    required: true
                },

                shipping: {
                    pickupLocation: {
                        type: mongoose.Schema.Types.Mixed,
                        default: null
                    },

                    deliveryLocation: {
                        type: mongoose.Schema.Types.Mixed,
                        default: null
                    },

                    deliveryFee: {
                        type: Number,
                        default: 0
                    },

                    deliveryMethod: {
                        type: String,
                        default: null
                    },

                    estimatedDelivery: {
                        type: String,
                        default: null
                    }
                }
            }
        ],

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

        platformFeesPercent: {
            type: Number,
            default: 20
        },

        platformFeesAmount: {
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

        buyerConfirmationStatus: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "PROBLEM"
            ],
            default: "PENDING"
        },

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