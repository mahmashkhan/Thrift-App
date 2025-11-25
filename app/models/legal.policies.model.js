import mongoose from "mongoose";

const LegalPolicySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["terms", "privacy", "custom"],
      default: "custom",
    }
  },
  { timestamps: true }
);

export default mongoose.model("LegalPolicy", LegalPolicySchema);
