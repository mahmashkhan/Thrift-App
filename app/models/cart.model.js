import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
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

            price: {
                type: Number,
                required: true
            },

            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
}, { timestamps: true });


export default mongoose.model("Cart", CartSchema);

















