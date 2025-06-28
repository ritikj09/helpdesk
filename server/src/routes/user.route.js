import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import {authenticateUser , authorizeUser} from "../middlewares/auth.js"
const router = express.Router();

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Logout user
router.post("/logout", authenticateUser , authorizeUser , logoutUser);

export default router;
