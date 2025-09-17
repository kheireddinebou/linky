import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true, // JS can't access
    secure: process.env.NODE_ENV === "production", // only https in prod
    sameSite: "none", // protect against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export function generateUsername(email: string) {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, ""); // safe prefix
  const suffix = Math.floor(1000 + Math.random() * 9000); // random 4-digit
  return `${base}${suffix}`;
}

export function isPasswordStrong(password: string) {
  return password.length >= 8;
  // If you want stricter:
  // return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/.test(password);
}

export function isValidEmail(email: string) {
  // Simple RFC5322-ish regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
