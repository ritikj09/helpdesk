import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const customError = error?.response?.data?.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(customError));
  }
);

const handleRequest = async (axiosCall) => {
  try {
    const res = await axiosCall();
    return res.data;
  } catch (err) {
    throw new Error(err.message);
  }
};

// USER
export const registerUser = (data) => handleRequest(() => axiosInstance.post("/user/register", data));
export const loginUser = (data) => handleRequest(() => axiosInstance.post("/user/login", data));
export const logoutUser = () => handleRequest(() => axiosInstance.post("/user/logout"));

// PERSONNEL
export const registerPersonnel = (data) => handleRequest(() => axiosInstance.post("/personnel/register", data));
export const loginPersonnel = (data) => handleRequest(() => axiosInstance.post("/personnel/login", data));
export const logoutPersonnel = () => handleRequest(() => axiosInstance.post("/personnel/logout"));
export const getAvailablePersonnelByCategory = (category) => handleRequest(() => axiosInstance.get(`/personnel/available/${category}`));

// ADMIN
export const registerAdmin = (data) => handleRequest(() => axiosInstance.post("/admin/register", data));
export const loginAdmin = (data) => handleRequest(() => axiosInstance.post("/admin/login", data));
export const logoutAdmin = () => handleRequest(() => axiosInstance.post("/admin/logout"));

// COMPLAINT
export const createComplaint = (data) => handleRequest(() => axiosInstance.post("/complaint/createComplaint", data));
export const deleteComplaint = (complaintId) =>
  handleRequest(() => axiosInstance.delete(`/complaint/delete/${complaintId}`));
export const updateComplaintStatus = (complaintId, status) =>
  handleRequest(() => axiosInstance.post(`/complaint/status/${complaintId}`, status));
export const getUserAssignedComplaints = (userId) =>
  handleRequest(() => axiosInstance.get(`/complaint/user/assigned/${userId}`));
export const getUserUnassignedComplaints = (userId) =>
  handleRequest(() => axiosInstance.get(`/complaint/user/unassigned/${userId}`));
export const getUnassignedComplaints = () =>
  handleRequest(() => axiosInstance.get("/complaint/unassigned"));
export const getAssignedComplaints = () =>
  handleRequest(() => axiosInstance.get("/complaint/assigned"));
export const assignComplaint = (assignData) =>
  handleRequest(() => axiosInstance.post("/complaint/assign", assignData));
export const getAssignedComplaintsToPersonnel = (personnelId) =>
  handleRequest(() => axiosInstance.get(`/complaint/assigned/${personnelId}`));

// NOTIFICATIONS
export const getNotifications = () => handleRequest(() => axiosInstance.get("/notification/getNotification"));
export const markNotificationAsRead = (notificationId) =>
  handleRequest(() => axiosInstance.get(`/notification/read/${notificationId}`));
export const deleteNotification = (notificationId) =>
  handleRequest(() => axiosInstance.delete(`/notification/delete/${notificationId}`));
export const getUnreadNotificationCount = () =>
  handleRequest(() => axiosInstance.get("/notification/unread/count"));

// PASSWORD RESET
export const forgotPassword = (data) => handleRequest(() => axiosInstance.post("/password/forgot-password", data));
export const resetPassword = (data) => handleRequest(() => axiosInstance.post("/password/reset-password", data));
