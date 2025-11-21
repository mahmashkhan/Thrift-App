import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
        {
            productId: { type: String, ref: "Product" },
            price: Number,
            bidId: { type: String, ref: "Bid", default: null }
        }
    ],
    totalAmount: String,
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);