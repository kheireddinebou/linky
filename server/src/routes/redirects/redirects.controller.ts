import { Request, Response } from "express";
import prisma from "../../config/prisma";
import redis from "../../config/redis";
import { cacheInRedis } from "../../utils/redist";

export const httpRedirectToOriginalUrl = async (
  req: Request,
  res: Response
) => {
  const { shortCode } = req.params;

  try {
    // Try Redis first
    let originalUrl = await redis.get(shortCode);

    if (!originalUrl) {
      // Fallback: DB lookup via Prisma
      const record = await prisma.urls.findUnique({
        where: { short_code: shortCode },
        select: { original_url: true, short_code: true },
      });

      if (!record) {
        return res.status(404).json({ message: "URL not found" });
      }

      originalUrl = record.original_url;

      // Cache for next time
      cacheInRedis(shortCode, originalUrl);
    }

    // Redirect immediately
    res.redirect(originalUrl);

    // Increment clicks in background (don't await to avoid delaying redirect)
    prisma.urls
      .update({
        where: { short_code: shortCode },
        data: { clicks: { increment: 1 } },
      })
      .catch(err => {
        console.error("Failed to increment clicks", err);
      });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
