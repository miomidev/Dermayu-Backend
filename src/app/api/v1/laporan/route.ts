import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getDbReportsList } from "@/lib/serverDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    let reports = getDbReportsList();

    if (status) {
      reports = reports.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    }

    if (severity) {
      reports = reports.filter((r) => r.severity.toLowerCase() === severity.toLowerCase());
    }

    return apiSuccess({
      data: reports,
      meta: {
        total: reports.length,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/laporan error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil data laporan genangan", 500);
  }
}

