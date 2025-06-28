import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Bell, User } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { logout as logoutAction } from "@/redux/authSlice";
import {
  getNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  logoutUser,
  logoutAdmin,
  logoutPersonnel,
} from "../axios/helper.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);
  const user = useSelector((state) => state.auth.user);

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  const fetchAllNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Unread count error:", err.message);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.NotificationID === notificationId ? { ...n, read: true } : n
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error("Mark as read failed:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      console.log(role)
      if (role === "user") await logoutUser();
      else if (role === "admin") await logoutAdmin();
      else if (role === "worker") await logoutPersonnel();

      dispatch(logoutAction());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
      alert("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    fetchUnreadCount(); 
  }, []);

  if (!user) return null;

  return (
    <nav className="w-full bg-white shadow-md px-4 py-3 flex justify-between items-center">
      <div className="text-xl font-bold text-blue-600">
        <Link to="/">Help Desk</Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <Dialog>
          <DialogTrigger
            className="relative"
            onClick={() => {
              fetchAllNotifications();
              fetchUnreadCount();
            }}
          >
            <Bell className="w-6 h-6 cursor-pointer" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </DialogTrigger>
          <DialogContent className="max-h-[400px] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3">Notifications</h2>
            {notifications.length === 0 && <p>No notifications available.</p>}
            {notifications.map((notif) => (
              <div
                key={notif.NotificationID}
                onClick={() => {
                  setSelectedNotification(notif);
                  if (!notif.read) handleMarkAsRead(notif.NotificationID);
                }}
                className={`border p-2 mb-2 rounded-md cursor-pointer ${
                  notif.read ? "bg-gray-100" : "bg-blue-100"
                }`}
              >
                <p className="font-semibold">{notif.Title}</p>
                <p className="text-sm text-gray-600 truncate">
                  {notif.Message}
                </p>
              </div>
            ))}
          </DialogContent>
        </Dialog>

        {/* Selected Notification Modal */}
        {selectedNotification && (
          <Dialog open onOpenChange={() => setSelectedNotification(null)}>
            <DialogContent>
              <h3 className="font-bold text-lg">
                {selectedNotification.Title}
              </h3>
              <p className="mt-2">{selectedNotification.Message}</p>
            </DialogContent>
          </Dialog>
        )}

        {/* Profile Popover */}
        <Popover open={profileOpen} onOpenChange={setProfileOpen}>
          <PopoverTrigger>
            <User className="w-6 h-6 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <h3 className="text-lg font-bold mb-2">Profile</h3>
            <p>
              <strong>Name:</strong> {user?.Name}
            </p>
            <p>
              <strong>Email:</strong> {user?.Email}
            </p>
            <p>
              <strong>Role:</strong> {role}
            </p>
          </PopoverContent>
        </Popover>

        {/* Logout Button */}
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
