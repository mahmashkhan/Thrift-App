import mongoose from "mongoose";

const otpRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // hashed password
  role: String,
  otp: Number,
  otpExpiry: Date
}, { timestamps: true });

export default mongoose.model('OtpRequest', otpRequestSchema);