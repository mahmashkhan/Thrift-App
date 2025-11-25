import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    bidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid", default: null },
    price: { type: Number, required: true },
    expiresAt: Date,
    quantity: { type: Number, default: 1 },
    // status: { type: String, enum: ["reserved", "purchased", "expired"], default: "reserved" }
}, { timestamps: true });


export default mongoose.model("Cart", CartSchema);

















