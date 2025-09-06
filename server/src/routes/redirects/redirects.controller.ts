import { Request, Response } from "express";
import pool from "../../config/db.js";
import redis from "../../config/redis.js";
import { cacheInRedis } from "../../utils/redist.js";

export const httpRedirectToOriginalUrl = async (
  req: Request,
  res: Response
) => {
  const { shortCode } = req.params;

  try {
    // Try Redis first
    let originalUrl = await redis.get(shortCode);

    if (!originalUrl) {
      // Fallback: DB lookup
      const result = await pool.query(
        `SELECT original_url FROM urls WHERE short_code=$1`,
        [shortCode]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "URL not found" });
      }

      originalUrl = result.rows[0].original_url;

      // Cache for next time
      cacheInRedis(shortCode, originalUrl!);
    }

    // 🚀 Redirect immediately
    res.redirect(originalUrl!);

    // 🔄 Increment clicks in background
    pool.query(`UPDATE urls SET clicks = clicks + 1 WHERE short_code=$1`, [
      shortCode,
    ]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
