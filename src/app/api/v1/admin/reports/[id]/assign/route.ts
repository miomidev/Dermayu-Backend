import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

const assignSchema = z.object({
  officerId: z.string().or(z.number()),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const result = assignSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Petugas penanganan wajib dipilih", 422);
    }

    const { officerId, notes } = result.data;
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

    const officer = await db.user.findFirst({
      where: {
        id: BigInt(officerId),
        role: "OFFICER",
      },
    });

    if (!officer) {
      return apiError("NOT_FOUND", "Petugas penanganan tidak ditemukan", 404);
    }

    const oldStatus = report.status;

    // Create assignment
    const assignment = await db.reportAssignment.create({
      data: {
        report_id: report.id,
        officer_id: officer.id,
        assigned_by: adminId,
        notes: notes || null,
      },
    });

    // Update report status
    const updatedReport = await db.report.update({
      where: { id: report.id },
      data: { status: "ASSIGNED" },
    });

    // Status history
    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        from_status: oldStatus,
        to_status: "ASSIGNED",
        changed_by: adminId,
        note: `Ditugaskan ke petugas: ${officer.full_name}. ${notes || ""}`.trim(),
      },
    });

    // Audit log
    await recordAuditLog({
      req,
      actorId: auth.context.user.userId,
      action: "ASSIGN_REPORT",
      entityType: "REPORT",
      entityId: report.id,
      metadata: {
        ticketCode: report.ticket_code,
        officerId: officer.id.toString(),
        officerName: officer.full_name,
        notes,
      },
    });

    // 1. Send notification to Officer (FR-NOTIF-02)
    await db.notification.create({
      data: {
        user_id: officer.id,
        type: "NEW_ASSIGNMENT",
        title: "Penugasan Penanganan Baru",
        body: `Anda ditugaskan menangani laporan [${report.ticket_code}]: "${report.title}".`,
        data: JSON.stringify({ reportId: report.public_id, ticketCode: report.ticket_code, assignmentId: assignment.id.toString() }),
      },
    });

    // 2. Send notification to Reporter (FR-NOTIF-01)
    await db.notification.create({
      data: {
        user_id: report.reporter_id,
        type: "REPORT_STATUS_CHANGED",
        title: "Petugas Sedang Ditugaskan",
        body: `Laporan Anda [${report.ticket_code}] telah ditugaskan kepada petugas (${officer.full_name}) untuk segera ditindaklanjuti.`,
        data: JSON.stringify({ reportId: report.public_id, ticketCode: report.ticket_code, status: "ASSIGNED" }),
      },
    });

    return apiSuccess({
      message: `Laporan berhasil ditugaskan ke ${officer.full_name}`,
      assignment,
      report: updatedReport,
    });
  } catch (error) {
    console.error("POST /admin/reports/[id]/assign error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menugaskan laporan", 500);
  }
}

