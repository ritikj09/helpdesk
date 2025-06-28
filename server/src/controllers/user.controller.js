import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pool from "../config/db.js"
import dotenv from "dotenv"

dotenv.config()

export const registerUser = async (req , res) => {
    const { name, rollNumber, email, phone, password } = req.body
    try {
        if (!name || !rollNumber || !email || !password || !phone)
        {
            return res.status(400).json({ message: "All fields are required" })
        }

        const [existingUser] = await pool.query(
            "SELECT * FROM User WHERE RollNumber = ? OR Email = ?",
            [rollNumber , email])
        console.log(existingUser);
        if(existingUser.length > 0)
            return res.status(400).json({message : "User already exists."})

        const hashedPassword = await bcrypt.hash(password , 10)
        const [newUser] = await pool.query(
            "INSERT INTO User(Name, RollNumber, Email, Phone, Password) VALUES(? , ? , ? , ? , ?)",
            [name , rollNumber , email , phone , hashedPassword]
        )
        console.log(newUser);
        res.status(200).json({ message : "User successfully registered."})

    } catch (error) {
        res.status(500).json({message : "something went wrong while registering user."})
    }
}

export const loginUser = async (req , res) => {
    const {email , password} = req.body
    try {
        if(!email || !password)
            return res.status(400).json({message : "All fields are required."})

        const [user] = await pool.query(
            "SELECT * FROM User WHERE Email = ?",
            [email]
        )

        if (user.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const userData = user[0]
        const isMatch = await bcrypt.compare(password, userData.Password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign(
            { userId: userData.UserID, email: userData.Email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000,
        })

        const { Password, ...userWithoutPassword } = userData

        res.status(200).json({
            message: "Login successful",
            user: userWithoutPassword
        })

    } catch (error) {
        res.status(500).json({message : "something went wrong while logging in user."})
    }
}

export const logoutUser = async (req , res) => {
    res.clearCookie("accessToken", { httpOnly: true, sameSite: "Strict" })
    res.json({ message: "User logged out successfully" })
}