import { Router } from "express";
import {
  getAppointmentsByPatient,
  getAppointmentById,
  addAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentsByDentist,
  updateAppointmentStatus,
  rescheduleAppointmentByDentist,  // ← add this
} from "../controllers/appointment.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// ─── Patient Routes ────────────────────────────────────────────────
router.get("/my-appointments", verifyToken, getAppointmentsByPatient);       // All my appointments
router.get("/my-appointments/:id", verifyToken, getAppointmentById);         // Single appointment
router.post("/", verifyToken, addAppointment);                               // Book appointment
router.patch("/:id/cancel", verifyToken, cancelAppointment);                 // Cancel appointment
router.patch("/:id/reschedule", verifyToken, rescheduleAppointment);         // Reschedule appointment

// ─── Dentist Routes ────────────────────────────────────────────────
router.get("/dentist/patients", verifyToken, getAppointmentsByDentist);      // View all patients
router.patch("/:id/status", verifyToken, updateAppointmentStatus);           // Confirm / Complete / Cancel             // Mark paid / unpaid
router.patch("/:id/dentist-reschedule", verifyToken, rescheduleAppointmentByDentist);
export default router;