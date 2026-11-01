import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

const rejectSchema = z.object({
  reason: z.string().min(5, "Alasan penolakan wajib diisi (minimal 5 karakter)"),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const result = rejectSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", result.error.issues[0]?.message || "Alasan penolakan tidak valid", 422);
    }

    const { reason } = result.data;
    const adminId = BigInt(auth.context.user.userId);

    const report = await db.report.findFirst({
      where: {
        OR: [
          { public_id: id },
          ...(isNaN(Number(id)) ? [] : [{ id: BigInt(id) }]),
          { ticket_code: id },
        ],
      },
    });

    if (!report) {
      return apiError("NOT_FOUND", "Laporan tidak ditemukan", 404);
    }

    const oldStatus = report.status;
    const updated = await db.report.update({
      where: { id: report.id },
      data: {
        status: "REJECTED",
        rejection_reason: reason,
      },
    });

    // Record status history
    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        from_status: oldStatus,
        to_status: "REJECTED",
        changed_by: adminId,
        note: `Ditolak oleh Admin. Alasan: ${reason}`,
      },
    });

    // Record audit log
    await recordAuditLog({
      req,
      actorId: auth.context.user.userId,
      action: "REJECT_REPORT",
      entityType: "REPORT",
      entityId: report.id,
      metadata: { ticketCode: report.ticket_code, reason },
    });

    // Notify reporter with reason (PRD FR-ADM-04)
    await db.notification.create({
      data: {
        user_id: report.reporter_id,
        type: "REPORT_STATUS_CHANGED",
        title: "Laporan Ditolak",
        body: `Laporan Anda [${report.ticket_code}] ditolak oleh admin. Alasan: "${reason}".`,
        data: JSON.stringify({ reportId: report.public_id, ticketCode: report.ticket_code, status: "REJECTED", reason }),
      },
    });

    return apiSuccess({
      message: "Laporan berhasil ditolak dengan alasan yang tercatat",
      report: updated,
    });
  } catch (error) {
    console.error("PATCH /admin/reports/[id]/reject error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menolak laporan", 500);
  }
}

