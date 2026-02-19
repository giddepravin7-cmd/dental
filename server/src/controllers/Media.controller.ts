import { Request, Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import fs from "fs";
import path from "path";

// ═══════════════════════════════════════════
//  CLINIC IMAGES
// ═══════════════════════════════════════════

// GET all images for a dentist
export const getClinicImages = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT id, image_url, caption, created_at FROM clinic_images WHERE dentist_id = ? ORDER BY created_at ASC`,
      [id]
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// POST upload clinic image (dentist only)
export const addClinicImage = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params; // dentist id
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  // Verify ownership
  const [rows] = await db.query(
    `SELECT id FROM dentists WHERE id = ? AND user_id = ?`, [id, userId]
  );
  if ((rows as any[]).length === 0)
    return res.status(403).json({ message: "Forbidden" });

  const { caption } = req.body;
  const image_url = `/uploads/${req.file.filename}`;

  try {
    const [result] = await db.query(
      `INSERT INTO clinic_images (dentist_id, image_url, caption) VALUES (?, ?, ?)`,
      [id, image_url, caption || null]
    );
    res.status(201).json({ message: "Image uploaded", id: (result as any).insertId, image_url, caption });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// DELETE clinic image (dentist only)
export const deleteClinicImage = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { imageId } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [rows] = await db.query(
      `SELECT ci.id, ci.image_url FROM clinic_images ci
       JOIN dentists d ON ci.dentist_id = d.id
       WHERE ci.id = ? AND d.user_id = ?`,
      [imageId, userId]
    );
    if ((rows as any[]).length === 0)
      return res.status(403).json({ message: "Forbidden or not found" });

    const imgPath = path.join(__dirname, "../../public", (rows as any[])[0].image_url);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await db.query(`DELETE FROM clinic_images WHERE id = ?`, [imageId]);
    res.json({ message: "Image deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// ═══════════════════════════════════════════
//  TESTIMONIALS (VIDEO)
// ═══════════════════════════════════════════

// GET all testimonials for a dentist
export const getTestimonials = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT id, video_url, patient_name, thumbnail_url, description, created_at
       FROM testimonials WHERE dentist_id = ? ORDER BY created_at DESC`,
      [id]
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// POST upload testimonial video (dentist only)
export const addTestimonial = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  if (!req.file) return res.status(400).json({ message: "No video uploaded" });

  const [rows] = await db.query(
    `SELECT id FROM dentists WHERE id = ? AND user_id = ?`, [id, userId]
  );
  if ((rows as any[]).length === 0)
    return res.status(403).json({ message: "Forbidden" });

  const { patient_name, description } = req.body;
  if (!patient_name) return res.status(400).json({ message: "patient_name is required" });

  const video_url = `/uploads/${req.file.filename}`;

  // Auto-generate thumbnail path placeholder (dentist can upload separately)
  const thumbnail_url = req.body.thumbnail_url || null;

  try {
    const [result] = await db.query(
      `INSERT INTO testimonials (dentist_id, video_url, patient_name, thumbnail_url, description) VALUES (?, ?, ?, ?, ?)`,
      [id, video_url, patient_name, thumbnail_url, description || null]
    );
    res.status(201).json({ message: "Testimonial uploaded", id: (result as any).insertId });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// DELETE testimonial (dentist only)
export const deleteTestimonial = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { testimonialId } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [rows] = await db.query(
      `SELECT t.id, t.video_url FROM testimonials t
       JOIN dentists d ON t.dentist_id = d.id
       WHERE t.id = ? AND d.user_id = ?`,
      [testimonialId, userId]
    );
    if ((rows as any[]).length === 0)
      return res.status(403).json({ message: "Forbidden or not found" });

    const vidPath = path.join(__dirname, "../../public", (rows as any[])[0].video_url);
    if (fs.existsSync(vidPath)) fs.unlinkSync(vidPath);

    await db.query(`DELETE FROM testimonials WHERE id = ?`, [testimonialId]);
    res.json({ message: "Testimonial deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// ═══════════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════════

// GET all reviews for a dentist
export const getReviews = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT r.id, u.name AS patient_name, r.rating, r.comment, r.created_at
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.dentist_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );
    const reviews = rows as any[];
    const average_rating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    res.json({ reviews, average_rating: Math.round(average_rating * 10) / 10 });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// POST submit a review (patient only)
export const addReview = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params; // dentist id
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { rating, comment } = req.body;
  if (!rating || !comment?.trim())
    return res.status(400).json({ message: "Rating and comment are required" });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5" });

  try {
    // Prevent duplicate reviews from same user
    const [existing] = await db.query(
      `SELECT id FROM reviews WHERE dentist_id = ? AND user_id = ?`, [id, userId]
    );
    if ((existing as any[]).length > 0)
      return res.status(409).json({ message: "You have already reviewed this dentist." });

    await db.query(
      `INSERT INTO reviews (dentist_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
      [id, userId, rating, comment.trim()]
    );
    res.status(201).json({ message: "Review submitted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// DELETE review (patient can delete their own; admin can delete any)
export const deleteReview = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const { reviewId } = req.params;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const whereClause = userRole === "ADMIN"
      ? `WHERE id = ?`
      : `WHERE id = ? AND user_id = ?`;
    const params = userRole === "ADMIN" ? [reviewId] : [reviewId, userId];

    const [rows] = await db.query(`SELECT id FROM reviews ${whereClause}`, params);
    if ((rows as any[]).length === 0)
      return res.status(403).json({ message: "Forbidden or not found" });

    await db.query(`DELETE FROM reviews WHERE id = ?`, [reviewId]);
    res.json({ message: "Review deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};