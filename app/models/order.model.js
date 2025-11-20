const OrderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            price: Number,
            bidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid", default: null }
        }
    ],
    totalAmount: Number,
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);