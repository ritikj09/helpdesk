import express from "express";
import { registerPersonnel, loginPersonnel, getAvailablePersonnelByCategory , logoutPersonnel } from "../controllers/personnel.controller.js";
import {authenticateUser , authorizeAdmin, authorizePersonnel} from "../middlewares/auth.js"
const router = express.Router();

// Register personnel
router.post("/register", registerPersonnel);

// Login personnel
router.post("/login", loginPersonnel);

router.post("/logout" , authenticateUser , authorizePersonnel , logoutPersonnel);

// Get available personnel by category
router.get("/available/:category", authenticateUser , authorizeAdmin , getAvailablePersonnelByCategory);

export default router;
