import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) {
      return apiError("UNAUTHORIZED", "Token autentikasi diperlukan", 401);
    }

    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPERADMIN")) {
      return apiError("FORBIDDEN", "Hanya Admin yang berwenang menghentikan Dering Evakuasi", 403);
    }

    const { id } = await params;

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

    const updated = await db.alert.update({
      where: { id: alert.id },
      data: {
        status: "ENDED",
        ended_by: BigInt(payload.userId),
        ends_at: new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        actor_id: BigInt(payload.userId),
        action: "END_DERING_EVAKUASI",
        entity_type: "ALERT",
        entity_id: alert.public_id,
        metadata: JSON.stringify({ title: alert.title }),
      },
    });

    return apiSuccess({
      message: "Dering Evakuasi telah dinyatakan berakhir",
      alert: updated,
    });
  } catch (error) {
    console.error("PATCH /admin/alerts/[id]/end error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengakhiri Dering Evakuasi", 500);
  }
}
