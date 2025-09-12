// src/controllers/urls.ts
import { Response } from "express";
import prisma from "../../config/prisma";
import { AuthRequest } from "../../middlewares/auth";
import { cacheInRedis } from "../../utils/redist";
import redis from "../../config/redis";

export const httpCreateUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { original_url, title } = req.body;
    const userIdRaw = req.userId;
    const userId = Number(userIdRaw);

    if (!original_url) {
      return res.status(400).json({ message: "original_url is required" });
    }

    try {
      new URL(original_url); // throws if invalid
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    const shortCode = Math.random().toString(36).substring(2, 10);

    // Cache in Redis immediately
    cacheInRedis(shortCode, original_url);

    const created = await prisma.urls.create({
      data: {
        user_id: userId,
        original_url,
        short_code: shortCode,
        title: title ?? null,
      },
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const httpGetUrls = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.userId);
    const urls = await prisma.urls.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
    res.status(200).json(urls);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const httpGetUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.userId);
    const { id } = req.params;
    const idNum = Number(id);

    const url = await prisma.urls.findFirst({
      where: { id: idNum, user_id: userId },
    });

    if (!url) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(url);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const httpUpdateUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.userId);
    const { id } = req.params;
    const idNum = Number(id);
    const { original_url, title } = req.body;

    // Require at least one field
    if (!original_url && title === undefined) {
      return res
        .status(400)
        .json({ message: "Provide at least one field to update" });
    }

    // Validate URL if provided
    if (original_url) {
      try {
        new URL(original_url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }
    }

    // Ensure the record belongs to the user
    const existing = await prisma.urls.findFirst({
      where: { id: idNum, user_id: userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }

    // Build data object dynamically
    const data: any = {};
    if (original_url) data.original_url = original_url;
    if (title !== undefined) data.title = title;
    data.updated_at = new Date();

    const updated = await prisma.urls.update({
      where: { id: existing.id },
      data,
    });

    // If original_url was updated → update Redis too
    if (original_url) {
      await redis.set(updated.short_code, updated.original_url);
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const httpDeleteUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.userId);
    const { id } = req.params;
    const idNum = Number(id);

    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    // Ensure ownership and get record
    const existing = await prisma.urls.findFirst({
      where: { id: idNum, user_id: userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }

    await prisma.urls.delete({ where: { id: existing.id } });

    // Remove from Redis
    await redis.del(existing.short_code);

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
