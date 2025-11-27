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
            enum: ["buyer", "seller", "admin"],
            default: "buyer"
        },
        phone: {
            type: Number,
            minlength: 11,
            
        },
        address: {
            type: String,
           
        },
        image: {
            type: String,
           
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


const User = mongoose.model("User", UserSchema);
export default User;
