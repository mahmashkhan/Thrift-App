import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    buyerId: String,
    productId: String,
    bidId: String,
    expiresAt: Date,
    status: { type: String, enum: ["reserved", "purchased", "expired"], default: "reserved" }
}, { timestamps: true });


export default mongoose.model("Cart", CartSchema);
