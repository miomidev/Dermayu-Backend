import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { saveUploadedFile } from "@/lib/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req, Roles.OFFICER_ONLY);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const officerId = BigInt(auth.context.user.userId);

    // Find assignment
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
    const formData = await req.formData();
    const notes = (formData.get("notes") as string) || "Bukti penanganan berhasil diunggah.";
    const mediaFiles = formData.getAll("media[]") as File[];

    if (!mediaFiles || mediaFiles.length === 0) {
      return apiError("VALIDATION_ERROR", "Minimal satu foto bukti penanganan wajib diunggah", 422);
    }

    const uploadedProofRecords = [];
    for (const file of mediaFiles) {
      if (file && typeof file === "object" && file.size > 0) {
        const saved = await saveUploadedFile(file);
        const record = await db.reportMedia.create({
          data: {
            report_id: report.id,
            type: "RESOLUTION_PROOF",
            storage_key: saved.storageKey,
            url: saved.url,
            mime_type: saved.mimeType,
            size_bytes: saved.sizeBytes,
            uploaded_by: officerId,
          },
        });
        uploadedProofRecords.push(record);
      }
    }

    // Mark as RESOLVED
    const oldStatus = report.status;
    const now = new Date();

    const updatedReport = await db.report.update({
      where: { id: report.id },
      data: {
        status: "RESOLVED",
        resolved_at: now,
      },
    });

    await db.reportAssignment.update({
      where: { id: assignment.id },
      data: {
        completed_at: now,
        notes,
      },
    });

    // Record Status History
    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        from_status: oldStatus,
        to_status: "RESOLVED",
        changed_by: officerId,
        note: `Penanganan selesai disertai ${uploadedProofRecords.length} foto bukti. Catatan: ${notes}`,
      },
    });

    // Notify Reporter
    await db.notification.create({
      data: {
        user_id: report.reporter_id,
        type: "REPORT_STATUS_CHANGED",
        title: "Laporan Telah Ditangani",
        body: `Petugas telah menyelesaikan penanganan laporan Anda [${report.ticket_code}]. Terima kasih atas laporannya!`,
        data: JSON.stringify({ reportId: report.public_id, ticketCode: report.ticket_code, status: "RESOLVED" }),
      },
    });

    return apiSuccess({
      message: "Bukti penanganan berhasil disimpan dan laporan diselesaikan",
      proofCount: uploadedProofRecords.length,
      report: updatedReport,
    });
  } catch (error) {
    console.error("POST /officer/assignments/[id]/proof error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengunggah bukti penanganan", 500);
  }
}

