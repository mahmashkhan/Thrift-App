import mongoose from "mongoose";

/**
 * FilterOption stores every selectable value for a product attribute
 * (brand, size, color, condition, location, or any new type admin adds later).
 *
 * - Sellers pick from these values when creating a product (validated server-side).
 * - Buyers use these values to build the filter sidebar on the frontend.
 * - Admin owns full CRUD over these — adding a new brand/size/etc. is just a
 *   new document here, no code deploy needed.
 *
 * "type" is intentionally a free string (not a hardcoded enum) so admin can
 * introduce a brand-new attribute category (e.g. "material", "fit") without
 * a schema change. If you want to lock it down to a known set, add an enum.
 */
const FilterOptionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
      default: null, // display label; falls back to `value` if not set
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate values within the same type (case-sensitive on value itself,
// but you can normalize casing at the controller level if you prefer).
FilterOptionSchema.index({ type: 1, value: 1 }, { unique: true });

export default mongoose.model("FilterOption", FilterOptionSchema);


