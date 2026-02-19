import { Request, Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import fs from "fs";
import path from "path";

export interface ServiceItem {
  category: string;
  service_name: string;
  fee: number;
}

export interface Dentist {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  qualification: string;
  experience: number;
  clinic_name: string;
  clinic_address: string;
  fees: number;
  specialization: string;
  latitude: number;
  longitude: number;
  status?: string;
  profile_photo?: string;
  services_offered?: ServiceItem[];
}

// GET all approved dentists
export const getAllDentists = async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT d.id, u.name, u.email, u.phone, d.qualification, d.experience, 
             d.clinic_name, d.clinic_address, d.fees, d.specialization, 
             d.latitude, d.longitude, d.profile_photo, d.services_offered
      FROM dentists d
      JOIN users u ON d.user_id = u.id
      WHERE d.status = 'APPROVED'
    `;
    const [rows] = await db.query(sql);
    res.json(rows as Dentist[]);
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// GET single dentist by ID
export const getDentistById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT d.id, u.name, u.email, u.phone, d.qualification, d.experience, 
             d.clinic_name, d.clinic_address, d.fees, d.specialization, 
             d.latitude, d.longitude, d.profile_photo, d.services_offered
      FROM dentists d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ? AND d.status = 'APPROVED'
    `;
    const [rows] = await db.query(sql, [id]);
    const dentists = rows as Dentist[];
    if (dentists.length === 0) return res.status(404).json({ message: "Dentist not found" });
    res.json(dentists[0]);
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// GET logged-in dentist's own profile
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const sql = `
      SELECT d.id, u.name, u.email, u.phone, d.qualification, d.experience,
             d.clinic_name, d.clinic_address, d.fees, d.specialization,
             d.latitude, d.longitude, d.status, d.profile_photo, d.services_offered
      FROM dentists d
      JOIN users u ON d.user_id = u.id
      WHERE d.user_id = ?
    `;
    const [rows] = await db.query(sql, [userId]);
    const dentists = rows as Dentist[];
    if (dentists.length === 0) return res.status(404).json({ message: "No dentist profile found" });
    res.json(dentists[0]);
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// ADD new dentist profile
export const addDentist = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const {
    qualification, experience, clinic_name, clinic_address,
    fees, specialization, latitude, longitude, services_offered,
  } = req.body;

  if (!qualification || !experience || !clinic_name || !clinic_address || !fees || !specialization) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  const profile_photo = req.file ? `/uploads/${req.file.filename}` : null;

  // Parse services_offered if it comes as a string
  let servicesJson = null;
  if (services_offered) {
    try {
      servicesJson = typeof services_offered === "string"
        ? services_offered
        : JSON.stringify(services_offered);
    } catch {
      return res.status(400).json({ message: "Invalid services_offered format" });
    }
  }

  try {
    const [existing] = await db.query(`SELECT id FROM dentists WHERE user_id = ?`, [userId]);
    if ((existing as any[]).length > 0) {
      return res.status(409).json({ message: "Dentist profile already exists" });
    }

    const sql = `
      INSERT INTO dentists
        (user_id, qualification, experience, clinic_name, clinic_address, fees,
         specialization, latitude, longitude, status, profile_photo, services_offered)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
    `;
    const [result] = await db.query(sql, [
      userId, qualification, experience, clinic_name, clinic_address,
      fees, specialization, latitude || 0, longitude || 0, profile_photo, servicesJson,
    ]);

    res.status(201).json({
      message: "Profile submitted! Awaiting admin approval.",
      dentistId: (result as any).insertId,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// UPDATE dentist profile
export const updateDentist = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const {
    qualification, experience, clinic_name, clinic_address,
    fees, specialization, latitude, longitude, services_offered,
  } = req.body;

  if (!qualification || !experience || !clinic_name || !clinic_address || !fees || !specialization) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, profile_photo FROM dentists WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    if ((rows as any[]).length === 0) {
      return res.status(403).json({ message: "Forbidden: You do not own this profile" });
    }

    const existingPhoto = (rows as any[])[0].profile_photo;
    let profile_photo = existingPhoto; // keep old photo if no new upload

    if (req.file) {
      profile_photo = `/uploads/${req.file.filename}`;
      // Delete old file if it exists
      if (existingPhoto) {
        const oldPath = path.join(__dirname, "../../public", existingPhoto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    let servicesJson = null;
    if (services_offered) {
      servicesJson = typeof services_offered === "string"
        ? services_offered
        : JSON.stringify(services_offered);
    }

    const sql = `
      UPDATE dentists
      SET qualification = ?, experience = ?, clinic_name = ?, clinic_address = ?,
          fees = ?, specialization = ?, latitude = ?, longitude = ?,
          profile_photo = ?, services_offered = ?
      WHERE id = ? AND user_id = ?
    `;
    await db.query(sql, [
      qualification, experience, clinic_name, clinic_address,
      fees, specialization, latitude || 0, longitude || 0,
      profile_photo, servicesJson, id, userId,
    ]);

    res.json({ message: "Profile updated successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// DELETE dentist profile
export const deleteDentist = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [rows] = await db.query(
      `SELECT id FROM dentists WHERE id = ? AND user_id = ?`, [id, userId]
    );
    if ((rows as any[]).length === 0) {
      return res.status(403).json({ message: "Forbidden: You do not own this profile" });
    }
    await db.query(`DELETE FROM dentists WHERE id = ? AND user_id = ?`, [id, userId]);
    res.json({ message: "Profile deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};