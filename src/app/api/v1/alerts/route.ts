import { NextRequest, connection } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";


export async function GET(req: NextRequest) {
  await connection();
  try {
    const url = new URL(req.url);
    const activeOnly = url.searchParams.get("active") !== "false";

    const alerts = await db.alert.findMany({
      where: activeOnly
        ? {
            status: { in: ["ACTIVE", "UPDATED"] },
          }
        : {},
      include: {
        targets: {
          include: {
            district: { select: { id: true, name: true } },
            village: { select: { id: true, name: true } },
          },
        },
        evacuation_points: {
          include: {
            evacuation_point: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return apiSuccess(alerts);
  } catch (error) {
    console.error("GET /alerts error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil daftar Dering Evakuasi", 500);
  }
}
