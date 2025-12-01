import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import otpStore from "../utils/otpStore.js";



const generateAndStoreOtp = async ({ name, email, password, role, phone, address, image }) => {

    // const otp = Math.floor(100000 + Math.random() * 900000);
    // const otpExpiry = Date.now() + 10 * 60 * 1000;

    const otp = Math.floor(1000 + Math.random() * 9000);

    const otpExpiry = Date.now() + 10 * 60 * 1000;

    // console.log("Here is hashedPass", hashedPassword);

    otpStore.set(email, { otp, name, password, role, otpExpiry, phone, address, image });

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
        from: `"Marketplace" <${process.env.EMAIL_USER}>`,
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