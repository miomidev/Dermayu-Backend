import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "dermayu_super_secret_jwt_key_2026_indramayu_responsive";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dermayu_super_secret_refresh_key_2026_indramayu_responsive";

export interface TokenPayload {
  userId: string;
  publicId: string;
  role: Role;
  fullName: string;
  email?: string | null;
  phone?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Hash refresh tokens and reset tokens using SHA-256 before saving to database (PRD SEC-03)
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateAccessToken(payload: TokenPayload): string {
  // Access token aktif selama 7 hari (1 minggu) sliding session sesuai kebutuhan pengguna
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function generateRefreshToken(payload: { userId: string }): string {
  // Refresh token: 14 hari
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "14d" });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7).trim();
}
