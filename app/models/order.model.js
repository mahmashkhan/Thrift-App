import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
        {
            productId: { type: String, ref: "Product" },
            productOwner: { type: String, ref: "Product" },
            quantity: { type: String, ref: "Product" },
            price: Number,
            bidId: { type: String, ref: "Bid", default: null }
        }
    ],
    productsAmount: Number,
    deliveryFee: Number,
    totalCustomerPays: Number,
    platformCommissionPercent: Number,
    platformCommissionAmount: Number,
    influencerCommissionPercent: Number,
    influencerCommissionAmount: Number,
    totalSellerGets: Number,
    shipping_type: { type: String, enum: ["self_selling", "sell_for_me"] },
    is_influencer_order: Boolean,
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);