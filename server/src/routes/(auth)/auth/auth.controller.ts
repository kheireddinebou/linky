import { Request, Response } from "express";
import pool from "../../../config/db";
import {
  comparePassword,
  generateToken,
  generateUsername,
  hashPassword,
  isPasswordStrong,
  isValidEmail,
  setAuthCookie,
} from "../../../utils/auth";

export const httpRegisterWithEmail = async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  try {
    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (!isPasswordStrong(password)) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (emailCheck.rows?.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    let username: string;
    let exists = true;
    do {
      username = generateUsername(email);
      const usernameCheck = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );
      exists = usernameCheck.rows?.length > 0;
    } while (exists);

    const hashed = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (username, email, password, provider)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [username, email, hashed, "local"]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);
    setAuthCookie(res, token);

    const { password: hashedPassword, ...others } = user;

    res.json({ user: others });
  } catch (err: any) {
    res.status(500).json({ error: "Server error" });
  }
};

export const httpLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user || user?.length < 1) {
      return res.status(400).json({ error: "Email is not exists" });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: "Password is not correct !" });
    }

    const token = generateToken(user.id);

    setAuthCookie(res, token);

    const { password: hashedPassword, ...others } = user;

    res.json({ user: others });
  } catch (err: any) {
    res.status(500).json({ error: "Server error" });
  }
};
