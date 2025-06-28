import express from "express";
import { registerAdmin, loginAdmin, logoutAdmin } from "../controllers/admin.controller.js";
import {authenticateUser , authorizeAdmin} from "../middlewares/auth.js"
const router = express.Router();

// Register an admin
router.post("/register", registerAdmin);

// Admin login
router.post("/login", loginAdmin);

// Admin logout
router.post("/logout", authenticateUser , authorizeAdmin , logoutAdmin);

export default router;
