const mongoose = require( "mongoose")

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["buyer", "seller", "influencer"], default: "buyer" },
  isVerified: { type: Boolean, default: false },
  verificationToken: String, // store OTP or token
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
