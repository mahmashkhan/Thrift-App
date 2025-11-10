const User = require('../models/userModel');
const otpStore = require('../utils/otpStore');

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const otpData = otpStore.get(email);
    if (!otpData)
      return res.status(404).json({ message: "No OTP request found" });

    if (otpData.otp !== Number(otp))
      return res.status(400).json({ message: "Invalid OTP" });

    if (otpData.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    // Create user
    const newUser = new User({
      name: otpData.name,
      email: email,
      password: otpData.hashedPassword,
      role: otpData.role,
      isVerified: true
    });

    await newUser.save();

    // Remove OTP from memory
    otpStore.delete(email);

    res.status(201).json({ message: "Email verified and user created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyOTP;
