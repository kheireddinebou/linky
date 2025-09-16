import { Request, Response } from "express";
import prisma from "../../../config/prisma";
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
  const { email, password, first_name, last_name } = req.body || {};

  try {
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

    const existingByEmail = await prisma.users.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingByEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // generate unique username (loop until free)
    let username: string;
    let exists = true;
    do {
      username = generateUsername(email);
      const existing = await prisma.users.findUnique({
        where: { username },
        select: { id: true },
      });
      exists = !!existing;
    } while (exists);

    const hashed = await hashPassword(password);

    const user = await prisma.users.create({
      data: {
        username,
        email,
        password: hashed,
        provider: "local",
        first_name: first_name || null,
        last_name: last_name || null,
      },
      // you can omit select to get full row; but don't return password
      select: {
        password: false,
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        avatar: true,
        provider: true,
        created_at: true,
      },
    });

    const token = generateToken(user.id);
    setAuthCookie(res, token);

    res.json({ user });
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

    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        first_name: true,
        last_name: true,
        avatar: true,
        provider: true,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Email does not exist" });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: "Password is not correct !" });
    }

    const token = generateToken(user.id);
    setAuthCookie(res, token);

    // remove password before sending
    const { password: _pw, ...others } = user;

    res.json({ user: others });
  } catch (err: any) {
    res.status(500).json({ error: "Server error" });
  }
};
