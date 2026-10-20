import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";


export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    const reports = await db.report.findMany({
      where: {
        status: {
          in: ["VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"],
        },
        ...(category ? { category: { code: category } } : {}),
      },
      select: {
        public_id: true,
        ticket_code: true,
        title: true,
        description: true,
        severity: true,
        water_level: true,
        status: true,
        latitude: true,
        longitude: true,
        address_text: true,
        occurred_at: true,
        category: {
          select: { code: true, name: true, icon: true },
        },
        media: {
          select: {
            url: true,
            type: true,
          },
        },
      },
      orderBy: { occurred_at: "desc" },
      take: 200,
    });

    return apiSuccess(reports);
  } catch (error) {
    console.error("GET /reports/public error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat peta laporan publik", 500);
  }
}
