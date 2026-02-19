import { Router } from "express";
import {
  getClinicImages, addClinicImage, deleteClinicImage,
  getTestimonials, addTestimonial, deleteTestimonial,
  getReviews, addReview, deleteReview,
} from "../controllers/Media.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { upload, videoUpload } from "../middlewares/upload.middleware";

const router = Router({ mergeParams: true }); // mergeParams so :id from parent is available

// ── Clinic Images ──────────────────────────
router.get("/images",             getClinicImages);
router.post("/images",            verifyToken, upload.single("image"), addClinicImage);
router.delete("/images/:imageId", verifyToken, deleteClinicImage);

// ── Testimonials ───────────────────────────
router.get("/testimonials",                   getTestimonials);
router.post("/testimonials",                  verifyToken, videoUpload.single("video"), addTestimonial);
router.delete("/testimonials/:testimonialId", verifyToken, deleteTestimonial);

// ── Reviews ────────────────────────────────
router.get("/reviews",              getReviews);
router.post("/reviews",             verifyToken, addReview);
router.delete("/reviews/:reviewId", verifyToken, deleteReview);

export default router;