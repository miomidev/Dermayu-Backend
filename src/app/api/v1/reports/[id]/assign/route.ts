import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

const assignSchema = z.object({
  officerId: z.string().or(z.number()),
  notes: z.string().optional(),
});

export async function POST(
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
    const result = assignSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Petugas penanganan wajib dipilih", 422);
    }

    const { id } = await params;
    const { officerId, notes } = result.data;

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

    // Verify officer exists
    const officer = await db.user.findFirst({
      where: {
        id: BigInt(officerId),
        role: "OFFICER",
      },
    });

    if (!officer) {
      return apiError("NOT_FOUND", "Petugas tidak ditemukan", 404);
    }

    // Create assignment
    const assignment = await db.reportAssignment.create({
      data: {
        report_id: report.id,
        officer_id: officer.id,
        assigned_by: BigInt(payload.userId),
        notes: notes || null,
      },
    });

    // Update report status to ASSIGNED
    const updatedReport = await db.report.update({
      where: { id: report.id },
      data: { status: "ASSIGNED" },
    });

    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        from_status: report.status,
        to_status: "ASSIGNED",
        changed_by: BigInt(payload.userId),
        note: `Ditugaskan ke petugas: ${officer.full_name}`,
      },
    });

    // Record audit log
    const { recordAuditLog } = await import("@/lib/audit");
    await recordAuditLog({
      req,
      actorId: payload.userId,
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

    return apiSuccess({
      message: `Laporan berhasil ditugaskan ke ${officer.full_name}`,
      assignment,
      report: updatedReport,
    });
  } catch (error) {
    console.error("POST /reports/[id]/assign error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menugaskan laporan", 500);
  }
}
