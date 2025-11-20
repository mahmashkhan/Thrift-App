import mongoose from "mongoose";

const BidSchema = new mongoose.Schema({
    productId: { type: String, ref: "Product", required: true },
    buyerId: { type: String, ref: "User", required: true },
    sellerId: { type: String, ref: "User", required: true },
    assignedTo: { type: String, ref: "User", required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "accepted"],
        default: "pending"
    },
    bidAmount: Number
}, { timestamps: true });


export default mongoose.model("Bid", BidSchema);
