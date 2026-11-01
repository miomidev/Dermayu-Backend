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
    if (!payload || (payload.role !== "SUPERADMIN")) {
      return apiError("FORBIDDEN", "Akses hanya untuk Admin", 403);
    }

    const { id } = await params;

    // Find report by public_id or internal numeric id
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

    const updated = await db.report.update({
      where: { id: report.id },
      data: {
        status: "VERIFIED",
        verified_by: BigInt(payload.userId),
        verified_at: new Date(),
      },
      include: {
        category: true,
        media: { include: { ai_prediction: true } },
      },
    });

    // Record status history
    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        from_status: report.status,
        to_status: "VERIFIED",
        changed_by: BigInt(payload.userId),
        note: "Laporan diverifikasi oleh Admin",
      },
    });

    // Record audit log
    const { recordAuditLog } = await import("@/lib/audit");
    await recordAuditLog({
      req,
      actorId: payload.userId,
      action: "VERIFY_REPORT",
      entityType: "REPORT",
      entityId: report.id,
      metadata: { ticketCode: report.ticket_code, title: report.title },
    });

    return apiSuccess({
      message: "Laporan berhasil diverifikasi",
      report: updated,
    });
  } catch (error) {
    console.error("PATCH /reports/[id]/verify error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memverifikasi laporan", 500);
  }
}
