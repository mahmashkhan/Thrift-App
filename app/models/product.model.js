// import { required } from "joi";
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String },
    color: { type: String, required: true },
    description: { type: String },

    price: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    imageUrls: [{ type: String }], // uploaded to S3 or Cloud

    categories: [{ type: Array, default: null }],

    // // Who originally created this product (seller or influencer)
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Listing type
    sellType: {
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
      enum: ["seller", "admin", "influencer"],
      default: "seller"
    },

    managedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
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
    size:
    {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"]
    }
    ,
    brand: {
      type: String,
      trim: true
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Used", "Refurbished"],
      default: "New"
    },
    details: {
      type: String,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    }
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
