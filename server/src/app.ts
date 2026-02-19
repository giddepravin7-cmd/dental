
import cors from "cors";
import dotenv from "dotenv";
import "./config/db";
import authRoutes from "./routes/auth.routes";
import dentistRoutes from "./routes/dentist.routes";
import appointmentRoutes from "./routes/appointment.routes";
import { verifyToken } from "./middlewares/auth.middleware";
import adminRoutes from "./routes/admin.routes";
import express from "express";
import path from "path";
import timeSlotRoutes from "./routes/timeSlot.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dentists", dentistRoutes);
app.use("/api/appointments", appointmentRoutes);

// Protected test route
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "You accessed a protected route successfully" });
});

// Health check
app.get("/", (req, res) => {
  res.send("Dentist Platform API Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// add this with the other routes:
app.use("/api/admin", adminRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Add alongside your other routes
app.use("/api", timeSlotRoutes);

export default app;
