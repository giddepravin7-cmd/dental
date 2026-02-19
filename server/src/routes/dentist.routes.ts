import { Router } from "express";
import {
  getAllDentists, getDentistById, addDentist,
  updateDentist, deleteDentist, getMyProfile,
} from "../controllers/dentist.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import mediaRoutes from "./Media.routes";

const router = Router();

router.get("/",        getAllDentists);
router.get("/me",      verifyToken, getMyProfile);
router.get("/:id",     getDentistById);
router.post("/",       verifyToken, upload.single("profile_photo"), addDentist);
router.put("/:id",     verifyToken, upload.single("profile_photo"), updateDentist);
router.delete("/:id",  verifyToken, deleteDentist);

// Mount media sub-routes: /api/dentists/:id/images|testimonials|reviews
router.use("/:id", mediaRoutes);

export default router;