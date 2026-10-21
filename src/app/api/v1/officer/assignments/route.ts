import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const auth = authorize(req, Roles.OFFICER_ONLY);
  if (!auth.ok) return auth.response;

  try {
    const assignments = await db.reportAssignment.findMany({
      where: {
        officer_id: BigInt(auth.context.user.userId),
      },
      include: {
        report: {
          include: {
            category: true,
            district: { select: { id: true, name: true } },
            village: { select: { id: true, name: true } },
            media: true,
            reporter: {
              select: { id: true, full_name: true, phone: true },
            },
          },
        },
      },
      orderBy: { assigned_at: "desc" },
    });

    return apiSuccess(assignments);
  } catch (error) {
    console.error("GET /officer/assignments error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat daftar penugasan", 500);
  }
}

const updateStatusSchema = z.object({
  reportId: z.string().or(z.number()),
  status: z.enum(["IN_PROGRESS", "RESOLVED"]),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const auth = authorize(req, Roles.OFFICER_ONLY);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const result = updateStatusSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data pembaruan status tidak valid", 422);
    }

    const { reportId, status, notes } = result.data;

    // Verify assignment belongs to this officer
    const assignment = await db.reportAssignment.findFirst({
      where: {
        report_id: BigInt(reportId),
        officer_id: BigInt(auth.context.user.userId),
      },
    });

    if (!assignment) {
      return apiError("FORBIDDEN", "Anda tidak ditugaskan pada laporan ini", 403);
    }

    const updateData: Record<string, any> = { status };
    if (status === "RESOLVED") {
      updateData.resolved_at = new Date();
    }

    const updatedReport = await db.report.update({
      where: { id: BigInt(reportId) },
      data: updateData,
    });

    if (status === "RESOLVED") {
      await db.reportAssignment.update({
        where: { id: assignment.id },
        data: {
          completed_at: new Date(),
          notes: notes || assignment.notes,
        },
      });
    }

    await db.reportStatusHistory.create({
      data: {
        report_id: BigInt(reportId),
        from_status: assignment.accepted_at ? "IN_PROGRESS" : "ASSIGNED",
        to_status: status,
        changed_by: BigInt(auth.context.user.userId),
        note: notes || `Diperbarui menjadi ${status} oleh Petugas Lapangan`,
      },
    });

    return apiSuccess({
      message: `Status laporan berhasil diperbarui menjadi ${status}`,
      report: updatedReport,
    });
  } catch (error) {
    console.error("PATCH /officer/assignments error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperbarui status laporan", 500);
  }
}
