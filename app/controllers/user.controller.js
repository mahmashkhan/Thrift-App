import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import otpStore from '../utils/otpStore.js';
import dotenv from "dotenv";
import nodemailer from "nodemailer"
dotenv.config();



const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role)
            return res.status(400).json({ message: "All fields are required" });

        const allowedRoles = ["buyer", "seller", "influencer"];
        if (!allowedRoles.includes(role))
            return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(", ")}` });

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


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // token valid for 7 days
        );

        // Return user info and token
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


export { createUser, loginUser, verifyOTP }