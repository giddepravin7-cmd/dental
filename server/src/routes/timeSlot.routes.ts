import { Router } from "express";
import {
  getSlotsByDentist,
  getMySlots,
  addSlot,
  deleteSlot,
} from "../controllers/timeSlot.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// Public – patients view available slots for a dentist
router.get("/dentists/:id/slots", getSlotsByDentist);

// Dentist only – manage their own slots
router.get("/my-slots",           verifyToken, getMySlots);
router.post("/my-slots",          verifyToken, addSlot);
router.delete("/my-slots/:slotId", verifyToken, deleteSlot);

export default router;