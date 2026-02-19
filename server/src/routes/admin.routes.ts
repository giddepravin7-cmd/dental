import { Router } from "express";
import {
  getAllDentistsAdmin,
  getDentistByIdAdmin,
  updateDentistStatus,
  updateDentistAdmin,
  deleteDentistAdmin,
  getAllUsers,
  deleteUser,
  getAdminStats,
} from "../controllers/admin.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

const router = Router();

// All admin routes require token + ADMIN role
router.use(verifyToken, requireAdmin);

// Stats
router.get("/stats", getAdminStats);

// Dentist management
router.get("/dentists",          getAllDentistsAdmin);
router.get("/dentists/:id",      getDentistByIdAdmin);
router.patch("/dentists/:id/status", updateDentistStatus);  // APPROVE / REJECT
router.put("/dentists/:id",      updateDentistAdmin);
router.delete("/dentists/:id",   deleteDentistAdmin);

// User management
router.get("/users",             getAllUsers);
router.delete("/users/:id",      deleteUser);

export default router;