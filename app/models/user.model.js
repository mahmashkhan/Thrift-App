import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
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

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: ["buyer", "seller", "admin", "influencer"],
            default: "buyer"
        },

        phone: {
            type: Number,
        },

        address: {
            type: String,
        },

        image: {
            type: String,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "suspended", "rejected", "pending"],
            default: "inactive"
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        // Influencer-specific fields
        commissionRate: {
            type: Number,
            default: 0
        },

        campaigns_run: {
            type: Number,
            default: 0
        },

        total_referrals: {
            type: Number,
            default: 0
        },

        commission_earned: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);


const User = mongoose.model("User", UserSchema);
export default User;
