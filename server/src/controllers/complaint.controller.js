import pool from "../config/db.js";

export const createComplaint = async (req, res) => {
    const userId = req.user.userId;
    const { Category, Description, Building, RoomNumber } = req.body;
    if (!userId || !Category || !Description || !Building || !RoomNumber) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO Complaint (UserID, Category, Description, Building, RoomNumber) VALUES (?, ?, ?, ?, ?)",
            [userId, Category, Description, Building, RoomNumber]
        );

        const [newComplaint] = await pool.query("SELECT * FROM Complaint WHERE ComplaintID = ?", [result.insertId]);

        res.status(200).json({
            message: "Complaint created successfully",
            complaint: newComplaint[0]
        });
    } catch (error) {
        console.log("error is : " , error);
        res.status(500).json({ message: "Database error" });
    }
}

export const deleteComplaint = async (req, res) => {
    const { complaintId } = req.params;
    const userId = req.user.userId;

    try {
        const [complaints] = await pool.query(
            "SELECT * FROM Complaint WHERE ComplaintID = ? AND UserID = ? AND Status != 'Completed'",
            [complaintId, userId]
        );

        if (complaints.length === 0) {
            return res.status(400).json({ message: "Complaint not found or cannot be deleted" });
        }

        await pool.query("DELETE FROM Assignment WHERE ComplaintID = ?", [complaintId]);
        await pool.query("DELETE FROM Complaint WHERE ComplaintID = ?", [complaintId]);

        res.status(200).json({ message: "Complaint deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
};

export const getComplaintById = async (req, res) => {
    const { complaintId } = req.params;

    try {
        const [complaint] = await pool.query("SELECT * FROM Complaint WHERE ComplaintID = ?", [complaintId]);

        if (complaint.length === 0) {
            return res.status(400).json({ message: "Complaint not found" });
        }

        res.status(200).json(complaint[0])
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const updateComplaintStatus = async (req, res) => {
    const { complaintId } = req.params;
    const { status } = req.body;
    console.log(complaintId)

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const [complaintRows] = await pool.query(
            "SELECT Status FROM Complaint WHERE ComplaintID = ?",
            [complaintId]
        );

        if (complaintRows.length === 0) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        const oldStatus = complaintRows[0].Status;

        const [result] = await pool.query(
            "UPDATE Complaint SET Status = ? WHERE ComplaintID = ?",
            [status, complaintId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Status unchanged" });
        }

        const [assignmentRows] = await pool.query(
            "SELECT PersonnelID FROM Assignment WHERE ComplaintID = ?",
            [complaintId]
        );

        if (assignmentRows.length > 0) {
            const workerId = assignmentRows[0].PersonnelID;

            if (oldStatus !== "Completed" && status === "Completed") {
                await pool.query(
                    "UPDATE Personnel SET CurrentComplaints = CurrentComplaints - 1 WHERE PersonnelID = ? AND CurrentComplaints > 0",
                    [workerId]
                );
            }

            if (oldStatus === "Completed" && status !== "Completed") {
                await pool.query(
                    "UPDATE Personnel SET CurrentComplaints = CurrentComplaints + 1 WHERE PersonnelID = ?",
                    [workerId]
                );
            }
        }

        res.status(200).json({ message: "Complaint status updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const getUserAssignedComplaints = async (req, res) => {
    const { userId } = req.params;

    try {
        const [complaints] = await pool.query(
            `SELECT c.*, p.Name AS PersonnelName 
            FROM Complaint c
            JOIN Assignment a ON c.ComplaintID = a.ComplaintID
            JOIN Personnel p ON a.PersonnelID = p.PersonnelID
            WHERE c.UserID = ? AND c.Status IN ('In Progress', 'Completed')`,
            [userId]
        );

        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const getUserUnassignedComplaints = async (req, res) => {
    const { userId } = req.params;
    console.log(userId);
    try {
        const [complaints] = await pool.query(
            `SELECT * FROM Complaint 
            WHERE UserID = ? 
            AND ComplaintID NOT IN (SELECT ComplaintID FROM Assignment) 
            ORDER BY CreatedAt DESC`,
            [userId]
        );

        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const getUnassignedComplaints = async (req, res) => {
    try {
        const [complaints] = await pool.query(
            `SELECT * FROM Complaint 
            WHERE ComplaintID NOT IN (SELECT ComplaintID FROM Assignment) 
            ORDER BY CreatedAt DESC`
        );

        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const getAssignedComplaints = async (req, res) => {
    try {
        const [complaints] = await pool.query(
            `SELECT c.*, p.Name AS AssignedPersonnel, a.AssignedAt
            FROM Complaint c
            JOIN Assignment a ON c.ComplaintID = a.ComplaintID
            JOIN Personnel p ON a.PersonnelID = p.PersonnelID
            ORDER BY c.CreatedAt DESC`
        );

        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: "Database error" });
    }
}

export const assignComplaint = async (req, res) => {
    const adminId = req.user.adminId;
    const { complaintId, personnelId } = req.body;

    try {

        if(!complaintId || !personnelId || !adminId)
            return res.status(400).json({message : "all fields are required."})

        const [existingAssignment] = await pool.query(
            "SELECT * FROM Assignment WHERE ComplaintID = ?",
            [complaintId]
        );

        if (existingAssignment.length > 0) {
            return res.status(400).json({ message: "Complaint is already assigned" });
        }

        const [worker] = await pool.query(
            "SELECT * FROM Personnel WHERE PersonnelID = ? AND CurrentComplaints < MaxComplaints",
            [personnelId]
        );

        if (worker.length === 0) {
            return res.status(400).json({ message: "Worker is not available or threshold exceeded" });
        }

        const [complaint] = await pool.query(
            "SELECT * FROM Complaint WHERE ComplaintID = ?",
            [complaintId]
        );

        if (complaint.length === 0) {
            return res.status(400).json({ message: "Complaint not found" });
        }

        const userId = complaint[0].UserID;

        await pool.query(
            "INSERT INTO Assignment (ComplaintID, PersonnelID, AssignedBy) VALUES (?, ?, ?)",
            [complaintId, personnelId, adminId]
        );

        await pool.query(
            "UPDATE Complaint SET Status = 'In Progress' WHERE ComplaintID = ?",
            [complaintId]
        );

        await pool.query(
            "UPDATE Personnel SET CurrentComplaints = CurrentComplaints + 1 WHERE PersonnelID = ?",
            [personnelId]
        );

        await pool.query(
            "INSERT INTO Notification (ReceiverID, ReceiverType, ComplaintID, Message) VALUES (?, 'User', ?, ?)",
            [userId, complaintId, `Your complaint has been assigned to ${worker[0].Name}.`]
        );

        await pool.query(
            "INSERT INTO Notification (ReceiverID, ReceiverType, ComplaintID, Message) VALUES (?, 'Worker', ?, ?)",
            [personnelId, complaintId, `You have been assigned a new complaint.`]
        );

        res.status(200).json({ message: "Complaint assigned successfully and notifications sent." });
    } catch (error) {
        console.log("error is : " , error)
        res.status(500).json({ message: "Database error" });
    }
}

export const getAssignedComplaintsToPersonnel = async (req, res) => {
    const { personnelId } = req.params;
  
    try {
      const [rows] = await pool.query(
        `SELECT 
           c.ComplaintID AS ComplaintID,
           c.Category AS Category,
           c.Description AS Description,
           c.Building AS Building,
           c.RoomNumber AS RoomNumber,
           c.Status AS Status,
           u.Name AS UserName
         FROM Assignment a
         JOIN Complaint c ON a.ComplaintID = c.ComplaintID
         JOIN User u ON c.UserID = u.UserID
         WHERE a.PersonnelID = ?`,
        [personnelId]
      );
  
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error fetching assigned complaints:", error);
      res.status(500).json({ message: "Database error" });
    }
}
  


