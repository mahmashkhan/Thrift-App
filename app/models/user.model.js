import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
            // required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: ["buyer", "seller", "admin"],
            default: "buyer"
        },

        status: {
            type: String,
            enum: [ "active", "suspended", "rejected"],
            default: "active"
        },

        isVerified: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Hash password before saving
// UserSchema.pre("save", async function (next) { 
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

const User = mongoose.model("User", UserSchema);
export default User;
