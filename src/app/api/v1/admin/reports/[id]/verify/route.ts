import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
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
        status: "VERIFIED",
        verified_by: adminId,
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
        from_status: oldStatus,
        to_status: "VERIFIED",
        changed_by: adminId,
        note: "Laporan telah diverifikasi oleh Admin",
      },
    });

    // Record audit log
    await recordAuditLog({
      req,
      actorId: auth.context.user.userId,
      action: "VERIFY_REPORT",
      entityType: "REPORT",
      entityId: report.id,
      metadata: { ticketCode: report.ticket_code, title: report.title },
    });

    // Send notification to reporter (PRD FR-NOTIF-01)
    await db.notification.create({
      data: {
        user_id: report.reporter_id,
        type: "REPORT_STATUS_CHANGED",
        title: "Laporan Terverifikasi",
        body: `Laporan Anda [${report.ticket_code}] telah diverifikasi oleh petugas dan siap ditindaklanjuti.`,
        data: JSON.stringify({ reportId: report.public_id, ticketCode: report.ticket_code, status: "VERIFIED" }),
      },
    });

    return apiSuccess({
      message: "Laporan berhasil diverifikasi",
      report: updated,
    });
  } catch (error) {
    console.error("PATCH /admin/reports/[id]/verify error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memverifikasi laporan", 500);
  }
}

