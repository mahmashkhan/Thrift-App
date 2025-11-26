import mongoose from "mongoose";
<<<<<<< HEAD
import bcrypt from "bcryptjs";
=======
>>>>>>> origin/recover-branch

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
<<<<<<< HEAD
            required: true,
=======
            // required: true,
>>>>>>> origin/recover-branch
            minlength: 6,
        },

        role: {
            type: String,
            enum: ["buyer", "seller", "admin"],
            default: "buyer"
        },
<<<<<<< HEAD
=======
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
>>>>>>> origin/recover-branch

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

<<<<<<< HEAD
// Hash password before saving
// UserSchema.pre("save", async function (next) { 
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });
=======
>>>>>>> origin/recover-branch

const User = mongoose.model("User", UserSchema);
export default User;
