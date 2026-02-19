import { Request, Response } from "express";
import db from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ALLOWED_ROLES = ["PATIENT", "DENTIST"];

// REGISTER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }

    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await db.query(
      `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, hashedPassword, role || "PATIENT"]
    );

    return res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET current logged-in user profile
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [rows]: any = await db.query(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(rows[0]);
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE current user's profile
export const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, phone } = req.body;

    if (!name && !phone) {
      return res.status(400).json({ message: "Provide at least one field to update (name, phone)" });
    }

    await db.query(
      `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?`,
      [name || null, phone || null, userId]
    );

    return res.json({ message: "Profile updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CHANGE password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: "current_password and new_password are required" });
    }

    const [rows]: any = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(current_password, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);

    return res.json({ message: "Password changed successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};