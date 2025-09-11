import { Response } from "express";
import pool from "../../config/db";
import { AuthRequest } from "../../middlewares/auth";
import { cacheInRedis } from "../../utils/redist";
import redis from "../../config/redis";

export const httpCreateUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { original_url, title } = req.body;
    const userId = req.userId;

    if (!original_url) {
      return res.status(400).json({ message: "original_url is required" });
    }

    try {
      new URL(original_url); // throws if invalid
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    const shortCode = Math.random().toString(36).substring(2, 10);

    cacheInRedis(shortCode, original_url);

    const result = await pool.query(
      `INSERT INTO urls (user_id, original_url, short_code, title) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, original_url, shortCode, title || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const httpGetUrls = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT * FROM urls WHERE user_id=$1 ORDER BY created_at DESC`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const httpGetUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM urls WHERE id=$1 AND user_id=$2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const httpUpdateUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { original_url, title } = req.body;

    // Require at least one field
    if (!original_url && !title) {
      return res
        .status(400)
        .json({ message: "Provide at least one field to update" });
    }

    // Validate URL if provided
    if (original_url) {
      try {
        new URL(original_url); // throws if invalid
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }
    }

    // Build dynamic query
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (original_url) {
      fields.push(`original_url=$${idx++}`);
      values.push(original_url);
    }

    if (title !== undefined) {
      fields.push(`title=$${idx++}`);
      values.push(title);
    }

    values.push(id, userId); // add where params

    const result = await pool.query(
      `UPDATE urls 
       SET ${fields.join(", ")}, updated_at=NOW() 
       WHERE id=$${idx++} AND user_id=$${idx} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    const url = result.rows[0];

    // If original_url was updated → update Redis too
    if (original_url) {
      await redis.set(url.short_code, url.original_url);
    }

    res.status(200).json(url);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete URL
export const httpDeleteUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "id is required" });
    }

    const result = await pool.query(
      `DELETE FROM urls WHERE id=$1 AND user_id=$2 RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    const url = result.rows[0];

    // Remove from Redis
    await redis.del(url.short_code);

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
