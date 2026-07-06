import mongoose from "mongoose";

const BidSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "accepted", "withdrawn"],
        default: "pending"
    },
    priceOffered: { type: Number, required: true },
    itemQuantity: { type: Number, required: true },
}, { timestamps: true });


export default mongoose.model("Bid", BidSchema);
