import { Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

export interface Appointment {
  id?: number;
  patient_id: number;
  dentist_id: number;
  appointment_date: string;
  appointment_time: string;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string;
}

// GET all appointments for logged-in patient
export const getAppointmentsByPatient = async (req: AuthRequest, res: Response) => {
  const patientId = req.user?.id;
  if (!patientId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [rows] = await db.query(
      `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
             d.clinic_name, d.clinic_address, d.fees, d.specialization,
             u.name AS dentist_name, u.phone AS dentist_phone, u.email AS dentist_email
      FROM appointments a
      JOIN dentists d ON a.dentist_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `,
      [patientId]
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET single appointment by ID (patient's own only)
export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  const patientId = req.user?.id;
  const { id } = req.params;
  if (!patientId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [rows] = await db.query(
      `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
             d.clinic_name, d.clinic_address, d.fees, d.specialization,
             u.name AS dentist_name, u.phone AS dentist_phone, u.email AS dentist_email
      FROM appointments a
      JOIN dentists d ON a.dentist_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.id = ? AND a.patient_id = ?
      `,
      [id, patientId]
    );
    const appointments = rows as Appointment[];
    if (appointments.length === 0)
      return res.status(404).json({ message: "Appointment not found" });

    res.json(appointments[0]);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// BOOK a new appointment
export const addAppointment = async (req: AuthRequest, res: Response) => {
  const patientId = req.user?.id;
  const { dentist_id, appointment_date, appointment_time, notes, slot_id } = req.body;
  if (!patientId) return res.status(401).json({ message: "Unauthorized" });

  if (!dentist_id || !appointment_date || !appointment_time)
    return res.status(400).json({ message: "dentist_id, appointment_date, and appointment_time are required" });

  try {
    // Check dentist exists and is approved
    const [dentistRows] = await db.query(
      `SELECT id FROM dentists WHERE id = ? AND status = 'APPROVED'`,
      [dentist_id]
    );
    if ((dentistRows as any[]).length === 0)
      return res.status(404).json({ message: "Dentist not found or not approved" });

    // Check slot is not already taken
    const [slotRows] = await db.query(
      `
      SELECT id FROM appointments
      WHERE dentist_id = ? AND appointment_date = ? AND appointment_time = ?
      AND status NOT IN ('CANCELLED')
      `,
      [dentist_id, appointment_date, appointment_time]
    );
    if ((slotRows as any[]).length > 0)
      return res.status(409).json({ message: "This time slot is already booked" });

    const [result] = await db.query(
      `
      INSERT INTO appointments (patient_id, dentist_id, appointment_date, appointment_time, notes, status)
      VALUES (?, ?, ?, ?, ?, 'PENDING')
      `,
      [patientId, dentist_id, appointment_date, appointment_time, notes || null]
    );

    // Mark slot as unavailable if slot_id was provided
    if (slot_id) {
      await db.query(
        `UPDATE time_slots SET is_available = FALSE WHERE id = ?`,
        [slot_id]
      );
    }

    res.status(201).json({
      message: "Appointment booked successfully",
      appointmentId: (result as any).insertId,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CANCEL appointment (patient's own only)
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  const patientId = req.user?.id;
  const { id } = req.params;
  if (!patientId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [rows] = await db.query(
      `SELECT id, status FROM appointments WHERE id = ? AND patient_id = ?`,
      [id, patientId]
    );
    const appointments = rows as Appointment[];

    if (appointments.length === 0)
      return res.status(404).json({ message: "Appointment not found" });
    if (appointments[0].status === "CANCELLED")
      return res.status(400).json({ message: "Appointment is already cancelled" });
    if (appointments[0].status === "COMPLETED")
      return res.status(400).json({ message: "Cannot cancel a completed appointment" });

    await db.query(
      `UPDATE appointments SET status = 'CANCELLED' WHERE id = ? AND patient_id = ?`,
      [id, patientId]
    );

    // Free up the slot again
    await db.query(
      `UPDATE time_slots SET is_available = TRUE 
       WHERE dentist_id = (SELECT dentist_id FROM appointments WHERE id = ?)
       AND slot_date = (SELECT appointment_date FROM appointments WHERE id = ?)
       AND slot_time = (SELECT appointment_time FROM appointments WHERE id = ?)`,
      [id, id, id]
    );

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// RESCHEDULE appointment (patient's own only, only if PENDING)
export const rescheduleAppointment = async (req: AuthRequest, res: Response) => {
  const patientId = req.user?.id;
  const { id } = req.params;
  const { appointment_date, appointment_time } = req.body;
  if (!patientId) return res.status(401).json({ message: "Unauthorized" });

  if (!appointment_date || !appointment_time)
    return res.status(400).json({ message: "appointment_date and appointment_time are required" });

  try {
    const [rows] = await db.query(
      `SELECT id, status, dentist_id FROM appointments WHERE id = ? AND patient_id = ?`,
      [id, patientId]
    );
    const appointments = rows as any[];

    if (appointments.length === 0)
      return res.status(404).json({ message: "Appointment not found" });
    if (appointments[0].status !== "PENDING")
      return res.status(400).json({ message: "Only PENDING appointments can be rescheduled" });

    // Check new slot availability
    const [slotRows] = await db.query(
      `
      SELECT id FROM appointments
      WHERE dentist_id = ? AND appointment_date = ? AND appointment_time = ?
      AND status NOT IN ('CANCELLED') AND id != ?
      `,
      [appointments[0].dentist_id, appointment_date, appointment_time, id]
    );
    if ((slotRows as any[]).length > 0)
      return res.status(409).json({ message: "This time slot is already booked" });

    await db.query(
      `UPDATE appointments SET appointment_date = ?, appointment_time = ? WHERE id = ? AND patient_id = ?`,
      [appointment_date, appointment_time, id, patientId]
    );

    res.json({ message: "Appointment rescheduled successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET all appointments for a dentist
export const getAppointmentsByDentist = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [dentistRows] = await db.query(
      `SELECT id FROM dentists WHERE user_id = ?`, [userId]
    );
    if ((dentistRows as any[]).length === 0)
      return res.status(404).json({ message: "Dentist profile not found" });

    const dentistId = (dentistRows as any[])[0].id;

    const [rows] = await db.query(
      `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
             u.name AS patient_name, u.phone AS patient_phone, u.email AS patient_email
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      WHERE a.dentist_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `,
      [dentistId]
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE appointment status (dentist only)
export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { status } = req.body;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const allowedStatuses = ["CONFIRMED", "COMPLETED", "CANCELLED"];
  if (!allowedStatuses.includes(status))
    return res.status(400).json({ message: `Status must be one of: ${allowedStatuses.join(", ")}` });

  try {
    const [dentistRows] = await db.query(
      `SELECT id FROM dentists WHERE user_id = ?`, [userId]
    );
    if ((dentistRows as any[]).length === 0)
      return res.status(403).json({ message: "Dentist profile not found" });

    const dentistId = (dentistRows as any[])[0].id;

    const [rows] = await db.query(
      `SELECT id, status FROM appointments WHERE id = ? AND dentist_id = ?`,
      [id, dentistId]
    );
    if ((rows as any[]).length === 0)
      return res.status(404).json({ message: "Appointment not found" });

    const current = (rows as any[])[0].status;
    if (current === "CANCELLED" || current === "COMPLETED")
      return res.status(400).json({ message: `Cannot update a ${current} appointment` });

    await db.query(
      `UPDATE appointments SET status = ? WHERE id = ? AND dentist_id = ?`,
      [status, id, dentistId]
    );

    res.json({ message: `Appointment marked as ${status}` });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};