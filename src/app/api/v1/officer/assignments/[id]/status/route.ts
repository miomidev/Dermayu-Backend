import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { ReportStatus } from "@prisma/client";

const updateStatusSchema = z.object({
  status: z.enum(["IN_PROGRESS", "RESOLVED"]),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req, Roles.OFFICER_ONLY);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const result = updateStatusSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data pembaruan status tidak valid", 422);
    }

    const { status, notes } = result.data;
    const officerId = BigInt(auth.context.user.userId);

    // Find assignment by assignment ID or by Report ID
    const assignment = await db.reportAssignment.findFirst({
      where: {
        officer_id: officerId,
        OR: [
          ...(isNaN(Number(id)) ? [] : [{ id: BigInt(id) }, { report_id: BigInt(id) }]),
          { report: { public_id: id } },
        ],
      },
      include: { report: true },
    });

    if (!assignment) {
      return apiError("FORBIDDEN", "Penugasan tidak ditemukan atau bukan milik Anda", 403);
    }

    const report = assignment.report;
    const oldStatus = report.status;

    // Update Report
    const reportUpdateData: { status: ReportStatus; resolved_at?: Date } = { status };
    if (status === "RESOLVED") {
      reportUpdateData.resolved_at = new Date();
    }

    const updatedReport = await db.report.update({
      where: { id: report.id },
      data: reportUpdateData,
    });

    // Update Assignment
    const assignmentUpdate: { accepted_at?: Date; completed_at?: Date; notes?: string } = {};
    if (status === "IN_PROGRESS" && !assignment.accepted_at) {
      assignmentUpdate.accepted_at = new Date();
    }
    if (status === "RESOLVED") {
      assignmentUpdate.completed_at = new Date();
    }
    if (notes) {
      assignmentUpdate.notes = notes;
    }

    await db.reportAssignment.update({
      where: { id: assignment.id },
      data: assignmentUpdate,
    });

    // Record Status History
    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        from_status: oldStatus,
        to_status: status,
        changed_by: officerId,
        note: notes || `Status diubah menjadi ${status} oleh Petugas Lapangan`,
      },
    });

    // Send in-app notification to the reporter
    await db.notification.create({
      data: {
        user_id: report.reporter_id,
        type: "REPORT_STATUS_CHANGED",
        title: `Status Laporan: ${status === "RESOLVED" ? "Selesai Ditangani" : "Sedang Ditangani"}`,
        body: `Laporan Anda [${report.ticket_code}] saat ini berstatus ${status === "RESOLVED" ? "SELESAI DITANGANI" : "SEDANG DITANGANI"}.`,
        data: JSON.stringify({ reportId: report.public_id, ticketCode: report.ticket_code, status }),
      },
    });

    return apiSuccess({
      message: `Status berhasil diubah menjadi ${status}`,
      report: updatedReport,
    });
  } catch (error) {
    console.error("PATCH /officer/assignments/[id]/status error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperbarui status penugasan", 500);
  }
}

