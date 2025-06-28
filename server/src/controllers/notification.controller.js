import pool from "../config/db.js";

export const getNotifications = async (req, res) => {
    let receiverType;
    let receiverId;
    if(req.user.role === "user")
    {
        receiverType = "User";
        receiverId = req.user.userId;
    }
    else
    {
        receiverType = "Worker";
        receiverId = req.user.personnelId;
    }
    console.log(receiverId , receiverType)

    try {
        const [notifications] = await pool.query(
            "SELECT * FROM Notification WHERE ReceiverID = ? AND ReceiverType = ? ORDER BY CreatedAt DESC",
            [receiverId, receiverType]
        );

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const [result] = await pool.query(
            "UPDATE Notification SET Status = 'Read' WHERE NotificationID = ?",
            [notificationId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    let userId;
    if(req.user.role === 'user')
        userId = req.user.userId;
    else
        userId = req.user.personnelId;

    try {
        const [notifications] = await pool.query(
            "SELECT * FROM Notification WHERE NotificationID = ?",
            [notificationId]
        );

        if (notifications.length === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        const notification = notifications[0];

        if (notification.ReceiverID !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this notification" });
        }

        await pool.query(
            "DELETE FROM Notification WHERE NotificationID = ?",
            [notificationId]
        );

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    let receiverType;
    let receiverId;
    if(req.user.role === "user")
    {
        receiverType = "User";
        receiverId = req.user.userId;
    }
    else
    {
        receiverType = "Worker";
        receiverId = req.user.personnelId;
    }

    try {
        const [[count]] = await pool.query(
            "SELECT COUNT(*) AS unreadCount FROM Notification WHERE ReceiverID = ? AND ReceiverType = ? AND Status = 'Unread'",
            [receiverId, receiverType]
        );

        res.status(200).json({ unreadCount: count.unreadCount });
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}
