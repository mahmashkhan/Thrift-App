import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    price: { type: Number, required: true },
    imageUrls: [{ type: String }], // uploaded to S3 or Cloud

    categories: [{ type: Array, default: null }],

    // // Who originally created this product (seller or influencer)
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Listing type
    saleType: {
      type: String,
      enum: ["self", "sellForMe", "influencer"],
      required: true
    },

    // If influencer is promoting another product
    // parentProductId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Product",
    //   default: null
    // },

    // Who manages shipping & order flow
    managedBy: {
      type: String,
      enum: ["seller", "company", "influencer"],
      default: "seller"
    },

    // Commission rate only applicable for influencer
    commissionRate: { type: Number, default: 0 },

    // Admin approval status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "inactive"],
      default: "pending"
    },

    // Optional admin remarks for rejection, updates etc
    remarks: { type: String },

    // For availability
    stock: { type: Number, default: 1 },

    // Track who approved product
    // approvedByAdmin: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   default: null
    // }
  },
  {
    tags: { type: Array, default: null }
  },

  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
