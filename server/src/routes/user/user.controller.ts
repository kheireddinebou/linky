import { Response } from "express";
import pool from "../../config/db";
import { AuthRequest } from "../../middlewares/auth";

export const httpGetUserData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing" });
    }

    const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [
      userId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...others } = result.rows[0];
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
