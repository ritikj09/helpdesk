
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import personnelRoutes from "./routes/personnel.route.js";
import complaintRoutes from "./routes/complaint.route.js";
import notificationRoutes from "./routes/notification.route.js";
import passwordRoutes from "./routes/password.route.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/personnel", personnelRoutes);
app.use("/api/complaint", complaintRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/password", passwordRoutes);

export default app;
