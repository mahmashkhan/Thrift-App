import mongoose from "mongoose";

const UserReviewSchema = new mongoose.Schema(
  {
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

UserReviewSchema.index({ sellerId: 1, reviewerId: 1 }, { unique: true });

const UserReview = mongoose.model("UserReview", UserReviewSchema);
export default UserReview;
