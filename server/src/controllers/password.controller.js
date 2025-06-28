import crypto from 'crypto';
import pool from "../config/db.js";
import otpStore from '../utils/otpStore.js'
import sendEmail from '../utils/sendEmail.js'
import bcrypt from "bcrypt";

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const [users] = await pool.query("SELECT * FROM User WHERE Email = ?", [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
        console.log("email sent")
        await sendEmail({
            to: email,
            subject: "Password Reset OTP",
            message: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`,
        })

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const storedOtp = otpStore[email];
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [result] = await pool.query("UPDATE User SET Password = ? WHERE Email = ?", [
            hashedPassword,
            email,
        ]);

        delete otpStore[email];

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
