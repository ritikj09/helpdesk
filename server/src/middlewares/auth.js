import jwt from "jsonwebtoken";
import pool from "../config/db.js"; 
import dotenv from "dotenv"

dotenv.config()

export const authenticateUser = async (req, res, next) => {
  const token = req.cookies?.accessToken
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;
    let role = null;

    [user] = await pool.query("SELECT * FROM User WHERE UserID = ?", [decoded.userId]);
    if (user.length > 0) role = "user";

    if (!role) {
      [user] = await pool.query("SELECT * FROM Admin WHERE AdminID = ?", [decoded.adminId]);
      if (user.length > 0) role = "admin";
    }

    if (!role) {
      [user] = await pool.query("SELECT * FROM Personnel WHERE PersonnelID = ?", [decoded.personnelId]);
      if (user.length > 0) role = "personnel";
    }
    if (!role) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    req.user = { ...decoded, role };
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};


export const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
  };
  
  export const authorizePersonnel = (req, res, next) => {
    if (req.user.role !== "personnel") {
      return res.status(403).json({ message: "Access denied. Personnel only." });
    }
    next();
  };
  
  export const authorizeUser = (req, res, next) => {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied. Users only." });
    }
    next();
  };
  