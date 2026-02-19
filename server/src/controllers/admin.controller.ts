import { Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

// GET all dentists (any status: PENDING, APPROVED, REJECTED)
export const getAllDentistsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await db.query(`
      SELECT d.id, u.name, u.email, u.phone, d.qualification, d.experience,
             d.clinic_name, d.clinic_address, d.fees, d.specialization,
             d.latitude, d.longitude, d.status
      FROM dentists d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.id DESC
    `);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET single dentist by ID (any status)
export const getDentistByIdAdmin = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT d.id, u.name, u.email, u.phone, d.qualification, d.experience,
             d.clinic_name, d.clinic_address, d.fees, d.specialization,
             d.latitude, d.longitude, d.status
      FROM dentists d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `, [id]);

    const dentists = rows as any[];
    if (dentists.length === 0) {
      return res.status(404).json({ message: "Dentist not found" });
    }
    res.json(dentists[0]);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// APPROVE or REJECT dentist
export const updateDentistStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["APPROVED", "REJECTED", "PENDING"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Status must be APPROVED, REJECTED, or PENDING" });
  }

  try {
    const [rows] = await db.query(`SELECT id FROM dentists WHERE id = ?`, [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: "Dentist not found" });
    }

    await db.query(`UPDATE dentists SET status = ? WHERE id = ?`, [status, id]);
    res.json({ message: `Dentist status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE any dentist profile
export const updateDentistAdmin = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    qualification, experience, clinic_name,
    clinic_address, fees, specialization, latitude, longitude,
  } = req.body;

  try {
    const [rows] = await db.query(`SELECT id FROM dentists WHERE id = ?`, [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: "Dentist not found" });
    }

    await db.query(`
      UPDATE dentists
      SET qualification = ?, experience = ?, clinic_name = ?, clinic_address = ?,
          fees = ?, specialization = ?, latitude = ?, longitude = ?
      WHERE id = ?
    `, [qualification, experience, clinic_name, clinic_address, fees, specialization, latitude, longitude, id]);

    res.json({ message: "Dentist profile updated successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE any dentist profile
export const deleteDentistAdmin = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`SELECT id FROM dentists WHERE id = ?`, [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: "Dentist not found" });
    }

    await db.query(`DELETE FROM dentists WHERE id = ?`, [id]);
    res.json({ message: "Dentist deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET all users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, email, phone, role, created_at
      FROM users
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE any user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`SELECT id, role FROM users WHERE id = ?`, [id]);
    const users = rows as any[];

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    if (users[0].role === "ADMIN") {
      return res.status(403).json({ message: "Cannot delete an admin account" });
    }

    await db.query(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET dashboard stats
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const [[totalUsers]]    = await db.query(`SELECT COUNT(*) as count FROM users WHERE role != 'ADMIN'`) as any;
    const [[totalDentists]] = await db.query(`SELECT COUNT(*) as count FROM dentists`) as any;
    const [[pending]]       = await db.query(`SELECT COUNT(*) as count FROM dentists WHERE status = 'PENDING'`) as any;
    const [[approved]]      = await db.query(`SELECT COUNT(*) as count FROM dentists WHERE status = 'APPROVED'`) as any;
    const [[totalAppts]]    = await db.query(`SELECT COUNT(*) as count FROM appointments`) as any;

    res.json({
      totalUsers:        totalUsers.count,
      totalDentists:     totalDentists.count,
      pendingDentists:   pending.count,
      approvedDentists:  approved.count,
      totalAppointments: totalAppts.count,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};