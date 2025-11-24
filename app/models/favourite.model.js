import mongoose from "mongoose";

const FavouriteSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
}, { timestamps: true });


export default mongoose.model("Favourite", FavouriteSchema);
