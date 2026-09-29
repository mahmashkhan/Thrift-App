import mongoose from "mongoose";

const courierConfigSchema = new mongoose.Schema({
    provider: {
        type: String,
        default: "quiqup"
    },

    baseFee: { type: Number, required: true, min: 0 },
    fuelSurchargePercent: { type: Number, required: true, min: 0 },
    vatPercent: { type: Number, required: true, min: 0 },
    radiusKm: { type: Number, required: true, min: 0 },

    beyondRadius: {
        feeType: {
            type: String,
            enum: ["unset", "flat", "per_km", "not_serviced"],
            default: "unset"
        },
        flatFee: { type: Number, default: null, min: 0 },
        perKmRate: { type: Number, default: null, min: 0 }
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

export default mongoose.model("CourierConfig", courierConfigSchema);