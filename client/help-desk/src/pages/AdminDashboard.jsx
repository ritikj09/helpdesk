import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getUnassignedComplaints,
  getAssignedComplaints,
  getAvailablePersonnelByCategory,
  assignComplaint,
} from "../axios/helper.jsx";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const admin = useSelector((state) => state.auth.user);
  const role = useSelector((state) => state.auth.role);
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState({});
  const [selectedWorker, setSelectedWorker] = useState({});

  const fetchData = async () => {
    try {
      const [unassigned, assigned] = await Promise.all([
        getUnassignedComplaints(),
        getAssignedComplaints(),
      ]);
      setPendingComplaints(unassigned);
      setAssignedComplaints(assigned);
    } catch (err) {
      console.error("Error fetching data:", err.message);
    }
  };

  useEffect(() => {
    if (role === "admin") fetchData();
  }, [admin]);

  const fetchAvailableWorkers = async (ComplaintId, Category) => {
    try {
      const workers = await getAvailablePersonnelByCategory(Category);
      setAvailableWorkers((prev) => ({ ...prev, [ComplaintId]: workers }));
    } catch (err) {
      console.error("Error fetching workers:", err.message);
    }
  };

  const handleAssign = async (ComplaintId) => {
    const workerId = selectedWorker[ComplaintId];
    if (!workerId) return alert("Please select a worker first");
    console.log(ComplaintId);
    try {
      await assignComplaint({ complaintId: ComplaintId, personnelId: workerId, adminId: admin.AdminID });

      const updatedComplaint = pendingComplaints.find((c) => c.ComplaintID === ComplaintId);
      const newAssigned = {
        ...updatedComplaint,
        assignedTo: availableWorkers[ComplaintId].find((w) => w.PersonnelID === workerId)?.Name,
        status: "In Progress",
      };

      // Update UI without full reload
      setPendingComplaints((prev) => prev.filter((c) => c.ComplaintID !== ComplaintId));
      setAssignedComplaints((prev) => [...prev, newAssigned]);

      // Clean up selection
      setAvailableWorkers((prev) => {
        const newMap = { ...prev };
        delete newMap[ComplaintId];
        return newMap;
      });
      setSelectedWorker((prev) => {
        const newMap = { ...prev };
        delete newMap[ComplaintId];
        return newMap;
      });
    } catch (err) {
      console.error("Error assigning complaint:", err.message);
      alert("Error assigning complaint");
    }
  };

  if (!admin || role !== "admin") {
    return <p className="p-4 text-red-500">Unauthorized Access</p>;
  }

  // console.log(pendingComplaints);

  return (
    <div className="flex gap-6 p-6">
      {/* Pending Complaints */}
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Pending Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingComplaints.length === 0 ? (
            <p>No pending complaints</p>
          ) : (
            pendingComplaints.map((c) => (
              <div key={c.ComplaintID} className="p-3 border rounded mb-4 bg-gray-50 space-y-1">
                <p><strong>Category:</strong> {c.Category}</p>
                <p><strong>Description:</strong> {c.Description}</p>
                <p><strong>Building:</strong> {c.Building}</p>
                <p><strong>Room:</strong> {c.RoomNumber}</p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fetchAvailableWorkers(c.ComplaintID, c.Category)}
                >
                  Load Available Workers
                </Button>

                {availableWorkers[c.ComplaintID] && (
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      className="p-2 border rounded"
                      value={selectedWorker[c.ComplaintID] || ""}
                      onChange={(e) =>
                        setSelectedWorker((prev) => ({
                          ...prev,
                          [c.ComplaintID]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Worker</option>
                      {availableWorkers[c.ComplaintID].map((w) => (
                        <option key={w.PersonnelID} value={w.PersonnelID}>
                          {w.Name}
                        </option>
                      ))}
                    </select>
                    <Button onClick={() => handleAssign(c.ComplaintID)}>Assign</Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Assigned Complaints */}
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Assigned Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedComplaints.length === 0 ? (
            <p>No assigned complaints</p>
          ) : (
            assignedComplaints.map((c) => (
              <div key={c.ComplaintID} className="p-3 border rounded mb-4 bg-green-50 space-y-1">
                <p><strong>Category:</strong> {c.Category}</p>
                <p><strong>Description:</strong> {c.Description}</p>
                <p><strong>Assigned To:</strong> {c.AssignedTo}</p>
                <p><strong>Status:</strong> {c.Status}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
