import { Request, Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

// GET all available slots for a dentist (public - for patients)
export const getSlotsByDentist = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT id, slot_date, slot_time, is_available
      FROM time_slots
      WHERE dentist_id = ?
        AND slot_date >= CURDATE()
        AND is_available = TRUE
      ORDER BY slot_date ASC, slot_time ASC
    `;
    const [rows] = await db.query(sql, [id]);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// GET all slots for dentist's own dashboard (includes unavailable)
export const getMySlots = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    // First get dentist id from user id
    const [dentistRows] = await db.query(
      `SELECT id FROM dentists WHERE user_id = ?`, [userId]
    );
    if ((dentistRows as any[]).length === 0)
      return res.status(404).json({ message: "Dentist profile not found" });

    const dentistId = (dentistRows as any[])[0].id;

    const sql = `
      SELECT id, slot_date, slot_time, is_available
      FROM time_slots
      WHERE dentist_id = ?
        AND slot_date >= CURDATE()
      ORDER BY slot_date ASC, slot_time ASC
    `;
    const [rows] = await db.query(sql, [dentistId]);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// POST add a new slot (dentist only)
export const addSlot = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { slot_date, slot_time } = req.body;
  if (!slot_date || !slot_time)
    return res.status(400).json({ message: "slot_date and slot_time are required" });

  try {
    const [dentistRows] = await db.query(
      `SELECT id FROM dentists WHERE user_id = ?`, [userId]
    );
    if ((dentistRows as any[]).length === 0)
      return res.status(404).json({ message: "Dentist profile not found" });

    const dentistId = (dentistRows as any[])[0].id;

    // Prevent past dates
    const today = new Date().toISOString().split("T")[0];
    if (slot_date < today)
      return res.status(400).json({ message: "Cannot add slots in the past" });

    const sql = `
      INSERT INTO time_slots (dentist_id, slot_date, slot_time)
      VALUES (?, ?, ?)
    `;
    await db.query(sql, [dentistId, slot_date, slot_time]);
    res.status(201).json({ message: "Slot added successfully" });
  } catch (error: any) {
    // Duplicate entry
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "This slot already exists" });
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// DELETE a slot (dentist only, only if still available)
export const deleteSlot = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { slotId } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [dentistRows] = await db.query(
      `SELECT id FROM dentists WHERE user_id = ?`, [userId]
    );
    if ((dentistRows as any[]).length === 0)
      return res.status(404).json({ message: "Dentist profile not found" });

    const dentistId = (dentistRows as any[])[0].id;

    // Check ownership and availability
    const [slotRows] = await db.query(
      `SELECT id, is_available FROM time_slots WHERE id = ? AND dentist_id = ?`,
      [slotId, dentistId]
    );
    if ((slotRows as any[]).length === 0)
      return res.status(404).json({ message: "Slot not found" });

    if (!(slotRows as any[])[0].is_available)
      return res.status(400).json({ message: "Cannot delete a booked slot" });

    await db.query(`DELETE FROM time_slots WHERE id = ?`, [slotId]);
    res.json({ message: "Slot deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};