import { NextRequest, connection } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { AlertLevel, AlertStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;

    const alert = await db.alert.findFirst({
      where: {
        OR: [
          { public_id: id },
          ...(isNaN(Number(id)) ? [] : [{ id: BigInt(id) }]),
        ],
      },
      include: {
        targets: {
          include: {
            district: true,
            village: true,
          },
        },
        evacuation_points: {
          include: {
            evacuation_point: true,
          },
        },
        deliveries: {
          take: 100,
          orderBy: { sent_at: "desc" },
        },
      },
    });

    if (!alert) {
      return apiError("NOT_FOUND", "Dering Evakuasi tidak ditemukan", 404);
    }

    return apiSuccess(alert);
  } catch (error) {
    console.error("GET /admin/alerts/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat detail Dering", 500);
  }
}

const updateAlertSchema = z.object({
  title: z.string().min(5).optional(),
  message: z.string().min(10).optional(),
  level: z.enum(["WASPADA", "SIAGA", "AWAS", "EVAKUASI"]).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "UPDATED", "ENDED"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const result = updateAlertSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data pembaruan Dering tidak valid", 422);
    }

    const alert = await db.alert.findFirst({
      where: {
        OR: [
          { public_id: id },
          ...(isNaN(Number(id)) ? [] : [{ id: BigInt(id) }]),
        ],
      },
    });

    if (!alert) {
      return apiError("NOT_FOUND", "Dering Evakuasi tidak ditemukan", 404);
    }

    const data = result.data;
    const updateData: {
      title?: string;
      message?: string;
      level?: AlertLevel;
      status?: AlertStatus;
    } = {};

    if (data.title) updateData.title = data.title;
    if (data.message) updateData.message = data.message;
    if (data.level) updateData.level = data.level as AlertLevel;
    if (data.status) updateData.status = data.status as AlertStatus;

    const updated = await db.alert.update({
      where: { id: alert.id },
      data: updateData,
    });

    return apiSuccess({
      message: "Dering Evakuasi berhasil diperbarui",
      alert: updated,
    });
  } catch (error) {
    console.error("PATCH /admin/alerts/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperbarui Dering", 500);
  }
}

