import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import otpStore from "../utils/otpStore.js";



const generateAndStoreOtp = async (userData) => {

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const expiresAt = new Date(Date.now() + (10 * 60 * 1000));

    otpStore.set(userData.email, {
        ...userData,
        otp,
        expiresAt
    });

    return otp;
};



const sendOtpEmail = async ({ name, email, otp }) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Thrift-app" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP for Email Verification",
        html: `
      <p>Hi ${name},</p>
      <p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>
    `,
    };

    await transporter.sendMail(mailOptions);
};



export { generateAndStoreOtp, sendOtpEmail }