import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) {
      return apiError("UNAUTHORIZED", "Token autentikasi diperlukan", 401);
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return apiError("UNAUTHORIZED", "Token tidak valid atau kedaluwarsa", 401);
    }

    const { id } = await params;

    const report = await db.report.findFirst({
      where: {
        OR: [
          { public_id: id },
          ...(isNaN(Number(id)) ? [] : [{ id: BigInt(id) }]),
        ],
      },
      include: {
        category: true,
        district: { select: { id: true, name: true } },
        village: { select: { id: true, name: true } },
        reporter: {
          select: {
            id: true,
            public_id: true,
            full_name: true,
            phone: true,
          },
        },
        media: {
          include: {
            ai_prediction: true,
          },
        },
        status_history: {
          orderBy: { created_at: "asc" },
          include: {
            actor: {
              select: { id: true, full_name: true, role: true },
            },
          },
        },
        assignments: {
          include: {
            officer: {
              select: { id: true, full_name: true, phone: true },
            },
          },
        },
      },
    });

    if (!report) {
      return apiError("NOT_FOUND", "Laporan tidak ditemukan", 404);
    }

    // Citizen can only access their own report
    if (payload.role === "CITIZEN" && report.reporter_id.toString() !== payload.userId) {
      return apiError("FORBIDDEN", "Anda tidak memiliki akses ke laporan ini", 403);
    }

    return apiSuccess(report);
  } catch (error) {
    console.error("GET /reports/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat detail laporan", 500);
  }
}
