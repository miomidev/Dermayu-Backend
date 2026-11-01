import { NextRequest } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth";

const resetSchema = z.object({
  resetToken: z.string().min(1, "Token reset kata sandi wajib disertakan"),
  newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
});

const JWT_SECRET = process.env.JWT_SECRET || "dermayu_super_secret_jwt_key_2026_indramayu_responsive";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = resetSchema.safeParse(body);
    if (!result.success) {
      const details = result.error.issues.map((e) => ({
        field: e.path.join("."),
        issue: e.message,
      }));
      return apiError("VALIDATION_ERROR", "Data reset kata sandi tidak valid", 422, details);
    }

    const { resetToken, newPassword } = result.data;

    let payload: { userId: string; type: string };
    try {
      payload = jwt.verify(resetToken, JWT_SECRET) as { userId: string; type: string };
    } catch {
      return apiError("UNAUTHORIZED", "Token reset kata sandi tidak valid atau telah kedaluwarsa", 401);
    }

    if (payload.type !== "RESET_PASSWORD") {
      return apiError("UNAUTHORIZED", "Tipe token tidak valid", 401);
    }

    const userId = BigInt(payload.userId);
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.is_active) {
      return apiError("NOT_FOUND", "Pengguna tidak ditemukan atau tidak aktif", 404);
    }

    // Hash new password (cost 12 per PRD SEC-02)
    const newHash = await hashPassword(newPassword);

    // Update user password
    await db.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    // Revoke all existing sessions for security
    await db.refreshToken.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });

    // Record audit log
    await db.auditLog.create({
      data: {
        actor_id: user.id,
        action: "RESET_PASSWORD_SUCCESS",
        entity_type: "USER",
        entity_id: user.public_id,
      },
    });

    return apiSuccess({
      message: "Kata sandi Anda berhasil diperbarui. Silakan login kembali.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperbarui kata sandi", 500);
  }
}

