import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pool from "../config/db.js"
import dotenv from "dotenv"

dotenv.config()

export const registerAdmin = async (req, res) => {
    const { name, email, phone, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, Email, and Password are required" })
    }

    try {
        const [existingAdmin] = await pool.query("SELECT * FROM Admin WHERE Email = ?", [email])

        if (existingAdmin.length > 0) {
            return res.status(400).json({ message: "Admin already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const [result] = await pool.query(
            "INSERT INTO Admin (Name, Email, Phone, Password) VALUES (?, ?, ?, ?)",
            [name, email, phone || null, hashedPassword]
        )

        const [newAdmin] = await pool.query(
            "SELECT AdminID, Name, Email, Phone FROM Admin WHERE AdminID = ?",
            [result.insertId]
        )

        res.status(200).json({
            message: "Admin registered successfully",
            admin: newAdmin[0]
        })
    } catch (error) {
        res.status(500).json({ message: "Database error" })
    }
}

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body

    try {
        const [admin] = await pool.query("SELECT * FROM Admin WHERE Email = ?", [email]);

        if (admin.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const adminData = admin[0];

        const isMatch = await bcrypt.compare(password, adminData.Password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { adminId: adminData.AdminID, email: adminData.Email, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("accessToken", token, {
            httpOnly: true,
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        const { Password, ...adminWithoutPassword } = adminData;

        res.status(200).json({
            message: "Admin login successful",
            user: adminWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const logoutAdmin = (req, res) => {
    res.clearCookie("accessToken", { httpOnly: true, sameSite: "Strict" });
    res.json({ message: "Admin logged out successfully" });
}

