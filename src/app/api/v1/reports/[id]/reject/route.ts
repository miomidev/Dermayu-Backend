import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

const rejectSchema = z.object({
  reason: z.string().min(5, "Alasan penolakan minimal 5 karakter"),
});

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
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPERADMIN")) {
      return apiError("FORBIDDEN", "Akses hanya untuk Admin", 403);
    }

    const body = await req.json();
    const result = rejectSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Alasan penolakan wajib diisi (minimal 5 karakter)", 422);
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

    const updated = await db.report.update({
      where: { id: report.id },
      data: {
        status: "REJECTED",
        rejection_reason: result.data.reason,
      },
    });

    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        from_status: report.status,
        to_status: "REJECTED",
        changed_by: BigInt(payload.userId),
        note: `Ditolak dengan alasan: ${result.data.reason}`,
      },
    });

    // Record audit log
    const { recordAuditLog } = await import("@/lib/audit");
    await recordAuditLog({
      req,
      actorId: payload.userId,
      action: "REJECT_REPORT",
      entityType: "REPORT",
      entityId: report.id,
      metadata: { ticketCode: report.ticket_code, reason: result.data.reason },
    });

    return apiSuccess({
      message: "Laporan berhasil ditolak",
      report: updated,
    });
  } catch (error) {
    console.error("PATCH /reports/[id]/reject error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menolak laporan", 500);
  }
}
