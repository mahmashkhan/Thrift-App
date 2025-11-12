import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: {
      type: String,
      validate: {
        validator: function (value) {
          
          if (!this.googleId && !value) {
            return false; 
          }
          return true; 
        },
        message: 'Password is required for signup with email/password.',
      },
    },
    googleId: { type: String }, 
    role: { type: String, enum: ["buyer", "seller", "influencer"], default: "buyer" },
    isVerified: { type: Boolean, default: false },
    verificationToken: String, 
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
export default User;
