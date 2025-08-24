// src/types/global.d.ts
import { Request } from "express";

export type AuthRequest = Request & {
  userId?: string;
};

declare global {
  type AuthRequest = AuthRequest;
}
