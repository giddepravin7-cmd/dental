import { Router } from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  changePassword,
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);          // Public
router.post("/login", loginUser);                // Public
router.get("/me", verifyToken, getMe);           // Private - get own profile
router.put("/me", verifyToken, updateMe);        // Private - update name/phone
router.patch("/me/password", verifyToken, changePassword); // Private - change password

export default router;