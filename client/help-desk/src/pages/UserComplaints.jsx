// Complete modified UserComplaints component
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import {
  getUserAssignedComplaints,
  getUserUnassignedComplaints,
  createComplaint,
  deleteComplaint
} from "../axios/helper.jsx";
import Spinner from "@/components/ui/spinner";

const UserComplaints = () => {
  const user = useSelector((state) => state.auth.user);
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [unassignedComplaints, setUnassignedComplaints] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [newComplaint, setNewComplaint] = useState({
    Category: "Electrical",
    Description: "",
    Building: "",
    RoomNumber: ""
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchComplaints = async () => {
    if(!user || !(user.UserID)) return;
    setLoading(true);
    try {
      const [assignedRes, unassignedRes] = await Promise.all([
        getUserAssignedComplaints(user.UserID),
        getUserUnassignedComplaints(user.UserID)
      ]);
      setAssignedComplaints(assignedRes || []);
      setUnassignedComplaints(unassignedRes || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (value) => setSelectedStatus(value);

  const handleDelete = async () => {
    try {
      await deleteComplaint(deletingId);
      setAssignedComplaints((prev) => prev.filter((c) => c.ComplaintID !== deletingId));
      setUnassignedComplaints((prev) => prev.filter((c) => c.ComplaintID !== deletingId));
      setDeletingId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to delete complaint");
    }
  };

  const handleInputChange = (e) =>
    setNewComplaint({ ...newComplaint, [e.target.name]: e.target.value });

  const handlecreateComplaint = async (e) => {
    e.preventDefault();
    if (newComplaint.Description.trim().length < 10) {
      alert("Description must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await createComplaint({ ...newComplaint});
      setNewComplaint({
        Category: "Electrical",
        Description: "",
        Building: "",
        RoomNumber: ""
      });
      await fetchComplaints();
    } catch (error) {
      console.error(error);
      alert("Failed to add complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const filterComplaints = (complaints) =>
    selectedStatus === "All"
      ? complaints
      : complaints.filter((c) => c.Status === selectedStatus);

  useEffect(() => {
    if (user.UserID) fetchComplaints();
  }, [user]);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Complaint List */}
      <Card className="md:w-2/3">
        <CardHeader>
          <CardTitle>Past Complaints</CardTitle>
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue>{selectedStatus}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spinner />
            </div>
          ) : (
            <>
              {["Assigned", "Unassigned"].map((type) => (
                <div key={type}>
                  <h3 className="text-lg font-bold mt-4 mb-2">{type} Complaints</h3>
                  {filterComplaints(
                    type === "Assigned" ? assignedComplaints : unassignedComplaints
                  ).map((c) => (
                    <div key={c.ComplaintID} className="p-3 border rounded mb-3 flex justify-between">
                      <div>
                        <p><strong>Category:</strong> {c.Category}</p>
                        <p><strong>Description:</strong> {c.Description}</p>
                        <p><strong>Status:</strong> {c.Status}</p>
                        {c.AssignedTo && <p><strong>Assigned to:</strong> {c.AssignedTo}</p>}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            onClick={() => setDeletingId(c.ComplaintID)}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <p className="text-lg font-medium">Are you sure?</p>
                          </AlertDialogHeader>
                          <p>This complaint will be permanently deleted.</p>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeletingId(null)}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Complaint Form */}
      <Card className="md:w-1/3">
        <CardHeader>
          <CardTitle>Add New Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlecreateComplaint} className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select
                value={newComplaint.Category}
                onValueChange={(value) =>
                  setNewComplaint({ ...newComplaint, Category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue>{newComplaint.Category}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                name="Description"
                value={newComplaint.Description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label>Building</Label>
              <Input
                name="Building"
                value={newComplaint.Building}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Room Number</Label>
              <Input
                name="RoomNumber"
                value={newComplaint.RoomNumber}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserComplaints;
