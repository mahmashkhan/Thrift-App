import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const InfluencerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        commissionRate: {
            type: String,
            default: false
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "pending"
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        // OPTIONAL fields for metrics
        campaigns_run: { type: Number, default: 0 },
        total_referrals: { type: Number, default: 0 },
        commission_earned: { type: Number, default: 0 }
    },
    { timestamps: true }
);

// Hash password before saving
InfluencerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const Influencer = mongoose.model("Influencer", InfluencerSchema);
export default Influencer;
