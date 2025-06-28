import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

export const registerPersonnel = async (req, res) => {
    const { name, email , phone, category, password } = req.body;
    const maxComplaints = 5;
    console.log(name , email , password , phone , category)
    if (!name || !email || !category || !password) {
        return res.status(400).json({ message: "Name, email , category, and password are required" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            "INSERT INTO Personnel (Name, Email , Phone, Category, MaxComplaints, CurrentComplaints, Password) VALUES (?, ? ,?, ?, ?, 0, ?)",
            [name, email , phone || null, category, maxComplaints , hashedPassword]
        );
        const [newPersonnel] = await pool.query(
            "SELECT PersonnelID, Name,Email , Phone, Category, MaxComplaints, CurrentComplaints FROM Personnel WHERE PersonnelID = ?",
            [result.insertId]
        );

        res.status(200).json({
            message: "Personnel registered successfully",
            personnel: newPersonnel[0]
        });
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const loginPersonnel = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [personnel] = await pool.query("SELECT * FROM Personnel WHERE Email = ?", [email]);

        if (personnel.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const personnelData = personnel[0];

        const isMatch = await bcrypt.compare(password, personnelData.Password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { personnelId: personnelData.PersonnelID, category: personnelData.Category },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.cookie("accessToken", token, {
            httpOnly: true,
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000, 
        });

        const { Password, ...personnelWithoutPassword } = personnelData;

        res.status(200).json({
            message: "Personnel login successful",
            user: personnelWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const logoutPersonnel = async (req , res) => {
    res.clearCookie("access_token", { httpOnly: true, sameSite: "Strict" })
    res.json({ message: "User logged out successfully" })
}

export const getAvailablePersonnelByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const [personnel] = await pool.query(
            "SELECT PersonnelID, Name, Phone, Category, MaxComplaints, CurrentComplaints FROM Personnel WHERE Category = ? AND CurrentComplaints < MaxComplaints",
            [category]
        );

        res.status(200).json(personnel);
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}