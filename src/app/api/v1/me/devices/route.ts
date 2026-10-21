import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize } from "@/lib/rbac";
import { DevicePlatform, Prisma } from "@prisma/client";

const registerDeviceSchema = z.object({
  platform: z.enum(["ANDROID", "IOS_PWA", "WEB"]),
  token: z.string().min(10, "Token perangkat tidak valid"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const result = registerDeviceSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data pendaftaran perangkat tidak valid", 422);
    }

    const { platform, token, latitude, longitude } = result.data;

    // Check if token already exists for this user, if so update last_seen_at
    const existing = await db.deviceToken.findFirst({
      where: {
        user_id: BigInt(auth.context.user.userId),
        token,
      },
    });

    if (existing) {
      const updated = await db.deviceToken.update({
        where: { id: existing.id },
        data: {
          last_seen_at: new Date(),
          is_active: true,
          last_known_lat: latitude ? new Prisma.Decimal(latitude) : existing.last_known_lat,
          last_known_lng: longitude ? new Prisma.Decimal(longitude) : existing.last_known_lng,
        },
      });
      return apiSuccess({ message: "Token perangkat diperbarui", device: updated });
    }

    const newDevice = await db.deviceToken.create({
      data: {
        user_id: BigInt(auth.context.user.userId),
        platform: platform as DevicePlatform,
        token,
        last_known_lat: latitude ? new Prisma.Decimal(latitude) : null,
        last_known_lng: longitude ? new Prisma.Decimal(longitude) : null,
      },
    });

    return apiSuccess({ message: "Perangkat berhasil didaftarkan untuk notifikasi", device: newDevice }, undefined, 201);
  } catch (error) {
    console.error("POST /me/devices error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mendaftarkan perangkat", 500);
  }
}

const deleteDeviceSchema = z.object({
  token: z.string().min(1),
});

export async function DELETE(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const result = deleteDeviceSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Token wajib disertakan", 422);
    }

    await db.deviceToken.updateMany({
      where: {
        user_id: BigInt(auth.context.user.userId),
        token: result.data.token,
      },
      data: {
        is_active: false,
      },
    });

    return apiSuccess({ message: "Perangkat berhasil dinonaktifkan" });
  } catch (error) {
    console.error("DELETE /me/devices error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menonaktifkan perangkat", 500);
  }
}
