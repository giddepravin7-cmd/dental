import { Router, Request, Response } from "express";
import {
  getSlotsByDentist,
  getMySlots,
  addSlot,
  deleteSlot,
} from "../controllers/timeSlot.controller";
import { verifyToken, AuthRequest } from "../middlewares/auth.middleware";
import db from "../config/db";

const router = Router();

// Public – patients view available slots for a dentist
router.get("/dentists/:id/slots", getSlotsByDentist);

// Dentist only – manage their own slots
router.get("/my-slots",            verifyToken, getMySlots);
router.post("/my-slots",           verifyToken, addSlot);
router.delete("/my-slots/:slotId", verifyToken, deleteSlot);

// ── TEMPORARY DEBUG ROUTE – remove after fixing ──
router.get("/debug-slots", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const [dentistRows] = await db.query(`SELECT id FROM dentists WHERE user_id = ?`, [userId]);
    const dentistId = (dentistRows as any[])[0].id;

    const [slots] = await db.query(
      `SELECT slot_date, slot_time FROM time_slots WHERE dentist_id = ? LIMIT 3`,
      [dentistId]
    );
    const [appts] = await db.query(
      `SELECT appointment_date, appointment_time FROM appointments WHERE dentist_id = ? LIMIT 3`,
      [dentistId]
    );
    res.json({ slots, appts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;