import { NextRequest, connection } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { AlertLevel, AlertTargetType, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  await connection();
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: Prisma.AlertWhereInput = {};
    if (status) {
      where.status = status as any;
    }

    const alerts = await db.alert.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        targets: {
          include: {
            district: { select: { id: true, name: true, code: true } },
            village: { select: { id: true, name: true, code: true } },
          },
        },
        evacuation_points: {
          include: {
            evacuation_point: true,
          },
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
    });

    return apiSuccess(alerts);
  } catch (error) {
    console.error("GET /admin/alerts error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat daftar Dering Evakuasi", 500);
  }
}

const createAlertSchema = z.object({
  title: z.string().min(5, "Judul Dering minimal 5 karakter"),
  message: z.string().min(10, "Pesan darurat minimal 10 karakter"),
  level: z.enum(["WASPADA", "SIAGA", "AWAS", "EVAKUASI"]),
  status: z.enum(["DRAFT", "ACTIVE"]).default("ACTIVE"),
  targetType: z.enum(["ALL", "DISTRICT", "VILLAGE", "RADIUS"]).default("ALL"),
  districtIds: z.array(z.string().or(z.number())).optional(),
  villageIds: z.array(z.string().or(z.number())).optional(),
  evacuationPointIds: z.array(z.string().or(z.number())).optional(),
  centerLat: z.number().optional(),
  centerLng: z.number().optional(),
  radiusM: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
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
    const adminId = BigInt(auth.context.user.userId);

    // Create Alert
    const alert = await db.alert.create({
      data: {
        title: data.title,
        message: data.message,
        level: data.level as AlertLevel,
        status: data.status,
        target_type: data.targetType as AlertTargetType,
        center_lat: data.centerLat ? new Prisma.Decimal(data.centerLat) : null,
        center_lng: data.centerLng ? new Prisma.Decimal(data.centerLng) : null,
        radius_m: data.radiusM || null,
        created_by: adminId,
      },
    });

    // Add district targets
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

    // Add village targets
    if (data.villageIds && data.villageIds.length > 0) {
      for (const vId of data.villageIds) {
        await db.alertTarget.create({
          data: {
            alert_id: alert.id,
            village_id: BigInt(vId),
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
        actor_id: adminId,
        action: data.status === "ACTIVE" ? "BROADCAST_DERING_EVAKUASI" : "CREATE_DRAFT_DERING",
        entity_type: "ALERT",
        entity_id: alert.public_id,
        metadata: JSON.stringify({
          level: data.level,
          targetType: data.targetType,
          title: data.title,
          status: data.status,
        }),
      },
    });

    return apiSuccess(
      {
        message: data.status === "ACTIVE" ? "Dering Evakuasi berhasil disiarkan!" : "Draft Dering berhasil disimpan",
        alert,
      },
      undefined,
      201
    );
  } catch (error) {
    console.error("POST /admin/alerts error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menyimpan Dering Evakuasi", 500);
  }
}
