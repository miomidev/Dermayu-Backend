import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const adminId = BigInt(auth.context.user.userId);

    const alert = await db.alert.findFirst({
      where: {
        OR: [
          { public_id: id },
          ...(isNaN(Number(id)) ? [] : [{ id: BigInt(id) }]),
        ],
      },
      include: {
        targets: true,
        evacuation_points: {
          include: { evacuation_point: true },
        },
      },
    });

    if (!alert) {
      return apiError("NOT_FOUND", "Dering Evakuasi tidak ditemukan", 404);
    }

    // Set alert status to ACTIVE
    await db.alert.update({
      where: { id: alert.id },
      data: {
        status: "ACTIVE",
        starts_at: new Date(),
      },
    });

    // Determine target users
    let targetUsersWhere: Record<string, any> = { is_active: true };

    if (alert.target_type === "DISTRICT") {
      const districtIds = alert.targets
        .map((t) => t.district_id)
        .filter((d): d is bigint => d !== null);
      targetUsersWhere.district_id = { in: districtIds };
    } else if (alert.target_type === "VILLAGE") {
      const villageIds = alert.targets
        .map((t) => t.village_id)
        .filter((v): v is bigint => v !== null);
      targetUsersWhere.village_id = { in: villageIds };
    }

    const targetUsers = await db.user.findMany({
      where: targetUsersWhere,
      select: {
        id: true,
        device_tokens: { where: { is_active: true } },
      },
      take: 2000,
    });

    let deliveryCount = 0;
    const notificationsToCreate = [];

    for (const u of targetUsers) {
      notificationsToCreate.push({
        user_id: u.id,
        type: "DERING_EVAKUASI",
        title: `🚨 [${alert.level}] ${alert.title}`,
        body: alert.message,
        data: JSON.stringify({
          alertId: alert.public_id,
          level: alert.level,
          startsAt: alert.starts_at,
          evacuationPoints: alert.evacuation_points.map((ep) => ({
            id: ep.evacuation_point.id.toString(),
            name: ep.evacuation_point.name,
            address: ep.evacuation_point.address,
            contactPhone: ep.evacuation_point.contact_phone,
          })),
        }),
      });

      for (const dt of u.device_tokens) {
        await db.alertDelivery.create({
          data: {
            alert_id: alert.id,
            user_id: u.id,
            device_token_id: dt.id,
            channel: dt.platform === "ANDROID" ? "FCM" : "WEBPUSH",
            status: "QUEUED",
            sent_at: new Date(),
          },
        });
        deliveryCount++;
      }
    }

    if (notificationsToCreate.length > 0) {
      await db.notification.createMany({
        data: notificationsToCreate,
      });
    }

    // Record audit log
    await recordAuditLog({
      req,
      actorId: auth.context.user.userId,
      action: "CONFIRM_SEND_DERING_EVAKUASI",
      entityType: "ALERT",
      entityId: alert.id,
      metadata: {
        alertId: alert.public_id,
        title: alert.title,
        level: alert.level,
        targetType: alert.target_type,
        usersNotified: notificationsToCreate.length,
        devicesQueued: deliveryCount,
      },
    });

    return apiSuccess({
      message: `Dering Evakuasi [${alert.level}] berhasil disiarkan!`,
      summary: {
        alertId: alert.public_id,
        title: alert.title,
        level: alert.level,
        usersNotified: notificationsToCreate.length,
        devicesQueued: deliveryCount,
      },
    });
  } catch (error) {
    console.error("POST /admin/alerts/[id]/send error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menyiarkan Dering Evakuasi", 500);
  }
}

