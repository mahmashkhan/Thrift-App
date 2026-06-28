import mongoose from "mongoose";

const PreferenceOptionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["brand", "size", "style"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const PreferenceOption = mongoose.model("PreferenceOption", PreferenceOptionSchema);
export default PreferenceOption;
