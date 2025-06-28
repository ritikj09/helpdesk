import express from "express";
import {
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
    getUnreadNotificationCount
} from "../controllers/notification.controller.js";
import {authenticateUser} from "../middlewares/auth.js"
const router = express.Router();

// Get all notifications for a user or worker
router.get("/getNotification", authenticateUser , getNotifications);

// Mark a notification as read
router.get("/read/:notificationId", authenticateUser , markNotificationAsRead);

// Delete a notification
router.delete("/delete/:notificationId", authenticateUser , deleteNotification);

// Get unread notification count
router.get("/unread/count", authenticateUser , getUnreadNotificationCount);

export default router;
