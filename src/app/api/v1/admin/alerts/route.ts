import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";
import { AlertLevel, AlertTargetType, Prisma } from "@prisma/client";

const createAlertSchema = z.object({
  title: z.string().min(5, "Judul Dering minimal 5 karakter"),
  message: z.string().min(10, "Pesan darurat minimal 10 karakter"),
  level: z.enum(["WASPADA", "SIAGA", "AWAS", "EVAKUASI"]),
  targetType: z.enum(["ALL", "DISTRICT", "VILLAGE", "RADIUS"]).default("ALL"),
  districtIds: z.array(z.string().or(z.number())).optional(),
  evacuationPointIds: z.array(z.string().or(z.number())).optional(),
  centerLat: z.number().optional(),
  centerLng: z.number().optional(),
  radiusM: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) {
      return apiError("UNAUTHORIZED", "Token autentikasi diperlukan", 401);
    }

    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPERADMIN")) {
      return apiError("FORBIDDEN", "Hanya Admin yang berwenang mengirim Dering Evakuasi", 403);
    }

    const body = await req.json();
    const result = createAlertSchema.safeParse(body);
    if (!result.success) {
      const details = result.error.issues.map((e) => ({
        field: e.path.join("."),
        issue: e.message,
      }));
      return apiError("VALIDATION_ERROR", "Data Dering Evakuasi tidak valid", 422, details);
    }

    const data = result.data;

    // Create Alert
    const alert = await db.alert.create({
      data: {
        title: data.title,
        message: data.message,
        level: data.level as AlertLevel,
        status: "ACTIVE",
        target_type: data.targetType as AlertTargetType,
        center_lat: data.centerLat ? new Prisma.Decimal(data.centerLat) : null,
        center_lng: data.centerLng ? new Prisma.Decimal(data.centerLng) : null,
        radius_m: data.radiusM || null,
        created_by: BigInt(payload.userId),
      },
    });

    // Add district targets if specified
    if (data.districtIds && data.districtIds.length > 0) {
      for (const dId of data.districtIds) {
        await db.alertTarget.create({
          data: {
            alert_id: alert.id,
            district_id: BigInt(dId),
          },
        });
      }
    }

    // Link evacuation points
    if (data.evacuationPointIds && data.evacuationPointIds.length > 0) {
      for (const epId of data.evacuationPointIds) {
        await db.alertEvacuationPoint.create({
          data: {
            alert_id: alert.id,
            evacuation_point_id: BigInt(epId),
          },
        });
      }
    }

    // Record audit log
    await db.auditLog.create({
      data: {
        actor_id: BigInt(payload.userId),
        action: "BROADCAST_DERING_EVAKUASI",
        entity_type: "ALERT",
        entity_id: alert.public_id,
        metadata: JSON.stringify({
          level: data.level,
          targetType: data.targetType,
          title: data.title,
        }),
      },
    });

    return apiSuccess(
      {
        message: "Dering Evakuasi berhasil disiarkan!",
        alert,
      },
      undefined,
      201
    );
  } catch (error) {
    console.error("POST /admin/alerts error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menyiarkan Dering Evakuasi", 500);
  }
}
