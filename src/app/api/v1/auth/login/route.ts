import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { generateAccessToken, generateRefreshToken, verifyPassword, hashToken } from "@/lib/auth";

const loginSchema = z.object({
  identifier: z.string().min(3, "Email atau nomor HP wajib diisi"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data login tidak valid", 422);
    }

    const { identifier, password } = result.data;

    // Find user by email or phone
    const user = await db.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      return apiError("UNAUTHORIZED", "Identitas atau kata sandi salah", 401);
    }

    if (!user.is_active) {
      return apiError("FORBIDDEN", "Akun Anda telah dinonaktifkan", 403);
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return apiError("UNAUTHORIZED", "Identitas atau kata sandi salah", 401);
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const accessToken = generateAccessToken({
      userId: user.id.toString(),
      publicId: user.public_id,
      role: user.role,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
    });

    const refreshToken = generateRefreshToken({ userId: user.id.toString() });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: hashToken(refreshToken),
        expires_at: expiresAt,
        device_info: req.headers.get("user-agent") || "unknown",
      },
    });

    const sessionPayload = {
      id: user.id.toString(),
      name: user.full_name,
      fullName: user.full_name,
      email: user.email,
      role: (user.role || "warga").toLowerCase(),
      district: "Kandanghaur - Eretan Wetan",
      loginTime: Date.now(),
      lastDashboardActive: Date.now(),
    };

    const res = apiSuccess({
      user: {
        id: user.id,
        publicId: user.public_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatar_url,
        districtId: user.district_id,
        villageId: user.village_id,
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: 900,
      },
    });

    res.cookies.set("user_session", encodeURIComponent(JSON.stringify(sessionPayload)), {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
    res.cookies.set("dermayu_token", accessToken, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return apiError("INTERNAL_ERROR", "Terjadi kesalahan pada server", 500);
  }
}
