import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from "@/lib/auth";

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token wajib disertakan"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = refreshSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Refresh token tidak valid", 422);
    }

    const { refreshToken } = result.data;

    // 1. Verify token signature
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return apiError("UNAUTHORIZED", "Refresh token tidak valid atau telah kedaluwarsa", 401);
    }

    // 2. Lookup hashed token in database
    const hashed = hashToken(refreshToken);
    const storedToken = await db.refreshToken.findUnique({
      where: { token_hash: hashed },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked_at || storedToken.expires_at < new Date()) {
      return apiError("UNAUTHORIZED", "Sesi login telah kedaluwarsa atau dicabut", 401);
    }

    if (!storedToken.user.is_active) {
      return apiError("FORBIDDEN", "Akun pengguna tidak aktif", 403);
    }

    const user = storedToken.user;

    // 3. Token Rotation (PRD SEC-03: revoke current, issue new)
    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked_at: new Date() },
    });

    const newAccessToken = generateAccessToken({
      userId: user.id.toString(),
      publicId: user.public_id,
      role: user.role,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
    });

    const newRefreshToken = generateRefreshToken({ userId: user.id.toString() });
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 14);

    await db.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: hashToken(newRefreshToken),
        expires_at: newExpiresAt,
        device_info: req.headers.get("user-agent") || "unknown",
      },
    });

    return apiSuccess({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: "Bearer",
        expiresIn: 7 * 24 * 3600,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperbarui token", 500);
  }
}

