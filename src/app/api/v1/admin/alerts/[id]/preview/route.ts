import { NextRequest, connection } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";

export async function POST(
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
        targets: true,
      },
    });

    if (!alert) {
      return apiError("NOT_FOUND", "Dering Evakuasi tidak ditemukan", 404);
    }

    let estimatedUsers = 0;
    let estimatedDevices = 0;

    if (alert.target_type === "ALL") {
      estimatedUsers = await db.user.count({ where: { is_active: true, role: "CITIZEN" } });
      estimatedDevices = await db.deviceToken.count({ where: { is_active: true } });
    } else if (alert.target_type === "DISTRICT") {
      const districtIds = alert.targets
        .map((t) => t.district_id)
        .filter((d): d is bigint => d !== null);

      estimatedUsers = await db.user.count({
        where: {
          is_active: true,
          district_id: { in: districtIds },
        },
      });

      estimatedDevices = await db.deviceToken.count({
        where: {
          is_active: true,
          user: { district_id: { in: districtIds } },
        },
      });
    } else if (alert.target_type === "VILLAGE") {
      const villageIds = alert.targets
        .map((t) => t.village_id)
        .filter((v): v is bigint => v !== null);

      estimatedUsers = await db.user.count({
        where: {
          is_active: true,
          village_id: { in: villageIds },
        },
      });

      estimatedDevices = await db.deviceToken.count({
        where: {
          is_active: true,
          user: { village_id: { in: villageIds } },
        },
      });
    } else {
      // Radius default estimate
      estimatedUsers = await db.user.count({ where: { is_active: true } });
      estimatedDevices = await db.deviceToken.count({ where: { is_active: true } });
    }

    return apiSuccess({
      alertId: alert.public_id,
      title: alert.title,
      level: alert.level,
      targetType: alert.target_type,
      targetCount: alert.targets.length,
      estimatedRecipients: {
        users: estimatedUsers,
        devices: estimatedDevices,
      },
    });
  } catch (error) {
    console.error("POST /admin/alerts/[id]/preview error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperkirakan jumlah penerima Dering", 500);
  }
}

