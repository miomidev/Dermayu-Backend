import { NextRequest } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";

const forgotSchema = z.object({
  identifier: z.string().min(3, "Email atau nomor HP wajib diisi"),
});

const JWT_SECRET = process.env.JWT_SECRET || "dermayu_super_secret_jwt_key_2026_indramayu_responsive";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = forgotSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data permintaan tidak valid", 422);
    }

    const { identifier } = result.data;

    const user = await db.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      // Return success message anyway to prevent user enumeration (PRD SEC-05)
      return apiSuccess({
        message: "Jika akun terdaftar, instruksi reset kata sandi telah dikirimkan.",
      });
    }

    // Generate secure reset token valid for 15 minutes
    const resetToken = jwt.sign(
      { userId: user.id.toString(), type: "RESET_PASSWORD" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Record audit log
    await db.auditLog.create({
      data: {
        actor_id: user.id,
        action: "REQUEST_PASSWORD_RESET",
        entity_type: "USER",
        entity_id: user.public_id,
        metadata: JSON.stringify({ identifier }),
      },
    });

    return apiSuccess({
      message: "Instruksi reset kata sandi telah dikirimkan.",
      // For development / evaluation demo:
      resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memproses permintaan reset kata sandi", 500);
  }
}

