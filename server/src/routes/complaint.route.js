import express from "express";
import {
    createComplaint,
    deleteComplaint,
    getComplaintById,
    updateComplaintStatus,
    getUserAssignedComplaints,
    getUserUnassignedComplaints,
    getUnassignedComplaints,
    getAssignedComplaints,
    assignComplaint,
    getAssignedComplaintsToPersonnel
} from "../controllers/complaint.controller.js";
import {authenticateUser , authorizeUser , authorizeAdmin , authorizePersonnel} from "../middlewares/auth.js"
const router = express.Router();

// Create a complaint
router.post("/createComplaint", authenticateUser , authorizeUser , createComplaint);

// Delete a complaint (only if status is Pending)
router.delete("/delete/:complaintId", authenticateUser , authorizeUser , deleteComplaint);

// Get complaint by ID
// router.get("/:complaintId", authenticateUser , getComplaintById);

// Update complaint status
router.post("/status/:complaintId", authenticateUser , updateComplaintStatus);

// Get complaints assigned to a user
router.get("/user/assigned/:userId", authenticateUser , authorizeUser , getUserAssignedComplaints);

// Get unassigned complaints for a user
router.get("/user/unassigned/:userId", authenticateUser , authorizeUser , getUserUnassignedComplaints);

// Get all unassigned complaints
router.get("/unassigned", authenticateUser , authorizeAdmin , getUnassignedComplaints);

// Get all assigned complaints
router.get("/assigned", authenticateUser , authorizeAdmin , getAssignedComplaints);

// Assign a complaint to a worker
router.post("/assign", authenticateUser , authorizeAdmin , assignComplaint);

router.get("/assigned/:personnelId", authenticateUser , authorizePersonnel , getAssignedComplaintsToPersonnel);


export default router;
