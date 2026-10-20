import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";


export async function GET() {
  try {
    const districts = await db.district.findMany({
      include: {
        villages: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return apiSuccess(districts);
  } catch (error) {
    console.error("GET /regions/districts error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil data wilayah", 500);
  }
}
