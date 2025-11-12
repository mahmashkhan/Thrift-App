const mongoose = require('mongoose');

const otpRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // hashed password
  role: String,
  otp: Number,
  otpExpiry: Date
}, { timestamps: true });

module.exports = mongoose.model('OtpRequest', otpRequestSchema);
