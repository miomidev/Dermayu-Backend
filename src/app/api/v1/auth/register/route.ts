import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { generateAccessToken, generateRefreshToken, hashPassword } from "@/lib/auth";

const registerSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().min(9, "Nomor HP minimal 9 digit").max(20).optional().or(z.literal("")),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  districtId: z.number().or(z.string()).optional(),
  villageId: z.number().or(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const details = result.error.issues.map((e) => ({
        field: e.path.join("."),
        issue: e.message,
      }));
      return apiError("VALIDATION_ERROR", "Data registrasi tidak valid", 422, details);
    }

    const { fullName, email, phone, password, districtId, villageId } = result.data;

    if (!email && !phone) {
      return apiError(
        "VALIDATION_ERROR",
        "Wajib mencantumkan email atau nomor HP",
        422,
        [{ field: "email", issue: "Harus diisi jika nomor HP kosong" }]
      );
    }

    // Check if email or phone already exists
    if (email) {
      const existingEmail = await db.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return apiError("CONFLICT", "Email sudah terdaftar", 409);
      }
    }

    if (phone) {
      const existingPhone = await db.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        return apiError("CONFLICT", "Nomor HP sudah terdaftar", 409);
      }
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        full_name: fullName,
        email: email || null,
        phone: phone || null,
        password_hash: passwordHash,
        role: "CITIZEN",
        district_id: districtId ? BigInt(districtId) : null,
        village_id: villageId ? BigInt(villageId) : null,
      },
      select: {
        id: true,
        public_id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        district_id: true,
        village_id: true,
        created_at: true,
      },
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

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: refreshToken,
        expires_at: expiresAt,
        device_info: req.headers.get("user-agent") || "unknown",
      },
    });

    return apiSuccess(
      {
        user,
        tokens: {
          accessToken,
          refreshToken,
          tokenType: "Bearer",
          expiresIn: 900, // 15 mins
        },
      },
      undefined,
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    return apiError("INTERNAL_ERROR", "Terjadi kesalahan pada server", 500);
  }
}
