import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  getAssignedComplaintsToPersonnel,
  updateComplaintStatus,
} from "../axios/helper";

const PersonnelDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusColors = {
    Pending: "bg-yellow-300",
    "In Progress": "bg-blue-300",
    Completed: "bg-green-300",
  };

  const statuses = ["Pending", "In Progress", "Completed"]; // ✅ status array for mapping

  const worker = useSelector((state) => state.auth.user);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAssignedComplaintsToPersonnel(worker.PersonnelID);
      setComplaints(data);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worker?.PersonnelID) {
      fetchComplaints();
    }
  }, [worker]);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      console.log("Updating complaint:", complaintId, "to", newStatus);

      // ✅ Call API to update status
      const response = await updateComplaintStatus(complaintId, { status: newStatus });
      console.log("Backend response:", response);

      // ✅ Option 1: Best practice - refetch data from backend after update
      await fetchComplaints();

      // ✅ Option 2 (commented): update local state manually
      // setComplaints((prev) =>
      //   prev.map((c) =>
      //     c.ComplaintID === complaintId ? { ...c, Status: newStatus } : c
      //   )
      // );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.message);
    }
  };

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl font-bold">Worker Dashboard</h1>
      {loading ? (
        <p>Loading complaints...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {complaints.map((complaint) => (
            <Card key={complaint.ComplaintID} className="p-4 border shadow-md">
              <CardHeader className="text-lg font-semibold flex justify-between">
                <span>{complaint.Category}</span>
                <span
                  className={`px-3 py-1 rounded ${statusColors[complaint.Status]}`}
                >
                  {complaint.Status}
                </span>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>User:</strong> {complaint.UserName || "Unknown"}
                </p>
                <p>
                  <strong>Room:</strong> {complaint.Building} -{" "}
                  {complaint.RoomNumber}
                </p>
                <p>
                  <strong>Description:</strong> {complaint.Description}
                </p>
                <div className="mt-4 flex gap-2">
                  <Select
                    onValueChange={(value) =>
                      handleStatusChange(complaint.ComplaintID, value)
                    }
                    defaultValue={complaint.Status}
                  >
                    <SelectTrigger>
                      <SelectValue>{complaint.Status}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() =>
                      handleStatusChange(complaint.ComplaintID, "Completed")
                    }
                    className="bg-green-600 hover:bg-green-700 text-white"
                    variant="success"
                  >
                    Mark Completed
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonnelDashboard;
