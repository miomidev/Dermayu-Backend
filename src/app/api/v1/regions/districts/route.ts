import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { INDRAMAYU_REGIONS } from "@/data/indramayuRegions";

export async function GET() {
  try {
    let districts = await db.district.findMany({
      include: {
        villages: {
          select: { id: true, code: true, name: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Jika database belum lengkap (misal villages masih 0), fallback ke INDRAMAYU_REGIONS lengkap
    if (!districts || districts.length === 0 || districts.every((d) => d.villages.length === 0)) {
      const formatted = INDRAMAYU_REGIONS.map((item, idx) => ({
        id: idx + 1,
        code: item.code,
        name: item.kecamatan,
        villages: item.villages.map((v, vIdx) => ({
          id: (idx + 1) * 100 + vIdx + 1,
          code: `${item.code}.${String(vIdx + 1).padStart(2, "0")}`,
          name: v,
        })),
      }));
      return apiSuccess(formatted);
    }

    return apiSuccess(districts);
  } catch (error) {
    console.error("GET /regions/districts error:", error);
    // Fallback aman jika database offline
    const formatted = INDRAMAYU_REGIONS.map((item, idx) => ({
      id: idx + 1,
      code: item.code,
      name: item.kecamatan,
      villages: item.villages.map((v, vIdx) => ({
        id: (idx + 1) * 100 + vIdx + 1,
        code: `${item.code}.${String(vIdx + 1).padStart(2, "0")}`,
        name: v,
      })),
    }));
    return apiSuccess(formatted);
  }
}

