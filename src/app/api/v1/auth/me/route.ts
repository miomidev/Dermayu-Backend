import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) {
      return apiError("UNAUTHORIZED", "Token autentikasi diperlukan", 401);
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return apiError("UNAUTHORIZED", "Token tidak valid atau kedaluwarsa", 401);
    }

    const user = await db.user.findUnique({
      where: { id: BigInt(payload.userId) },
      select: {
        id: true,
        public_id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        avatar_url: true,
        district_id: true,
        village_id: true,
        created_at: true,
        district: {
          select: { id: true, code: true, name: true },
        },
        village: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!user) {
      return apiError("NOT_FOUND", "Pengguna tidak ditemukan", 404);
    }

    return apiSuccess(user);
  } catch (error) {
    console.error("GET /me error:", error);
    return apiError("INTERNAL_ERROR", "Terjadi kesalahan pada server", 500);
  }
}

const updateProfileSchema = z.object({
  fullName: z.string().min(3).optional(),
  phone: z.string().min(9).max(20).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  districtId: z.number().or(z.string()).optional(),
  villageId: z.number().or(z.string()).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) {
      return apiError("UNAUTHORIZED", "Token autentikasi diperlukan", 401);
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return apiError("UNAUTHORIZED", "Token tidak valid atau kedaluwarsa", 401);
    }

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data pembaruan profil tidak valid", 422);
    }

    const data = result.data;
    const updateData: {
      full_name?: string;
      phone?: string;
      avatar_url?: string | null;
      district_id?: bigint | null;
      village_id?: bigint | null;
    } = {};

    if (data.fullName) updateData.full_name = data.fullName;
    if (data.phone) updateData.phone = data.phone;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl || null;
    if (data.districtId !== undefined) updateData.district_id = data.districtId ? BigInt(data.districtId) : null;
    if (data.villageId !== undefined) updateData.village_id = data.villageId ? BigInt(data.villageId) : null;

    const updatedUser = await db.user.update({
      where: { id: BigInt(payload.userId) },
      data: updateData,
      select: {
        id: true,
        public_id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        avatar_url: true,
        district_id: true,
        village_id: true,
      },
    });

    return apiSuccess(updatedUser);
  } catch (error) {
    console.error("PATCH /me error:", error);
    return apiError("INTERNAL_ERROR", "Terjadi kesalahan pada server", 500);
  }
}
