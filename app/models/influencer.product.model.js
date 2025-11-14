import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"] },
    description: { type: String },
    price: { type: Number, required: [true, "Product price is required"] },
    categories: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended", "active"],
      default: "pending"
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Influencer",
      required: [true, "Influencer ID is required"]
    },
    reason: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("InfluencerProduct", ProductSchema);
