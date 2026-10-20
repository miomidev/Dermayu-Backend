import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";


export async function GET(req: NextRequest) {
  try {
    const points = await db.evacuationPoint.findMany({
      where: { is_active: true },
      include: {
        district: { select: { id: true, name: true } },
        village: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return apiSuccess(points);
  } catch (error) {
    console.error("GET /evacuation-points error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil titik evakuasi", 500);
  }
}
