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
    if (!payload) {
      return apiError("UNAUTHORIZED", "Token tidak valid", 401);
    }

    const { id } = await params;

    const report = await db.report.findFirst({
      where: {
        OR: [
          { public_id: id },
          ...(isNaN(Number(id)) ? [] : [{ id: BigInt(id) }]),
        ],
      },
    });

    if (!report) {
      return apiError("NOT_FOUND", "Laporan tidak ditemukan", 404);
    }

    if (report.reporter_id.toString() !== payload.userId) {
      return apiError("FORBIDDEN", "Anda tidak berhak membatalkan laporan ini", 403);
    }

    if (report.status !== "SUBMITTED") {
      return apiError("CONFLICT", "Laporan sudah diproses dan tidak dapat dibatalkan", 409);
    }

    const updated = await db.report.update({
      where: { id: report.id },
      data: { status: "CANCELLED" },
    });

    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        from_status: "SUBMITTED",
        to_status: "CANCELLED",
        changed_by: BigInt(payload.userId),
        note: "Dibatalkan oleh pelapor",
      },
    });

    return apiSuccess({
      message: "Laporan berhasil dibatalkan",
      report: updated,
    });
  } catch (error) {
    console.error("PATCH /reports/[id]/cancel error:", error);
    return apiError("INTERNAL_ERROR", "Gagal membatalkan laporan", 500);
  }
}
