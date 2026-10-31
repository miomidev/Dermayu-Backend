import { NextRequest, connection } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connection();
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) {
      return apiError("UNAUTHORIZED", "Token autentikasi diperlukan", 401);
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return apiError("UNAUTHORIZED", "Token tidak valid atau kedaluwarsa", 401);
    }

    const reports = await db.report.findMany({
      where: {
        reporter_id: BigInt(payload.userId),
      },
      include: {
        category: true,
        media: {
          include: {
            ai_prediction: true,
          },
        },
        district: { select: { id: true, name: true } },
        village: { select: { id: true, name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return apiSuccess(reports);
  } catch (error) {
    console.error("GET /reports/mine error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat riwayat laporan saya", 500);
  }
}
