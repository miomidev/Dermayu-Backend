import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

const duplicateSchema = z.object({
  duplicateOfId: z.string().or(z.number()),
  notes: z.string().optional(),
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
    const result = duplicateSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "ID laporan acuan duplikat wajib disertakan", 422);
    }

    const { duplicateOfId, notes } = result.data;
    const adminId = BigInt(auth.context.user.userId);

    // Find the report to be marked as duplicate
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

    // Find the primary master report
    const masterReport = await db.report.findFirst({
      where: {
        OR: [
          { public_id: String(duplicateOfId) },
          ...(isNaN(Number(duplicateOfId)) ? [] : [{ id: BigInt(duplicateOfId) }]),
          { ticket_code: String(duplicateOfId) },
        ],
      },
    });

    if (!masterReport) {
      return apiError("NOT_FOUND", "Laporan utama rujukan tidak ditemukan", 404);
    }

    const oldStatus = report.status;
    const updated = await db.report.update({
      where: { id: report.id },
      data: {
        status: "DUPLICATE",
        duplicate_of_id: masterReport.id,
      },
    });

    // Record status history
    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        from_status: oldStatus,
        to_status: "DUPLICATE",
        changed_by: adminId,
        note: `Ditandai duplikat dari laporan ${masterReport.ticket_code}. ${notes || ""}`.trim(),
      },
    });

    // Record audit log
    await recordAuditLog({
      req,
      actorId: auth.context.user.userId,
      action: "MARK_DUPLICATE_REPORT",
      entityType: "REPORT",
      entityId: report.id,
      metadata: {
        ticketCode: report.ticket_code,
        duplicateOfTicketCode: masterReport.ticket_code,
      },
    });

    // Notify reporter
    await db.notification.create({
      data: {
        user_id: report.reporter_id,
        type: "REPORT_STATUS_CHANGED",
        title: "Laporan Telah Dilaporkan Sebelumnya",
        body: `Laporan Anda [${report.ticket_code}] telah ditandai sebagai duplikat dari kejadian yang sama [${masterReport.ticket_code}] dan saat ini sedang ditangani bersama.`,
        data: JSON.stringify({
          reportId: report.public_id,
          ticketCode: report.ticket_code,
          masterTicketCode: masterReport.ticket_code,
          status: "DUPLICATE",
        }),
      },
    });

    return apiSuccess({
      message: `Laporan berhasil ditandai duplikat dari ${masterReport.ticket_code}`,
      report: updated,
    });
  } catch (error) {
    console.error("PATCH /admin/reports/[id]/duplicate error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menandai laporan duplikat", 500);
  }
}

