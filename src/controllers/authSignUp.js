const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const otpStore = require('../utils/otpStore'); // import the in-memory store

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required" });

    const allowedRoles = ["buyer", "seller", "influencer"];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(", ")}` });

    const User = require('../models/userModel');
    const userExist = await User.findOne({ email });
    if (userExist)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP + user info in memory
    otpStore.set(email, { otp, name, hashedPassword, role, otpExpiry });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Marketplace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Email Verification",
      html: `<p>Hi ${name},</p>
             <p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to your email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = signup;
