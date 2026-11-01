import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize } from "@/lib/rbac";
import { saveUploadedFile } from "@/lib/storage";
import { triggerAiPrediction } from "@/lib/ai-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const userId = BigInt(auth.context.user.userId);
    const userRole = auth.context.user.role;

    const report = await db.report.findFirst({
      where: {
        OR: [
          { public_id: id },
          ...(isNaN(Number(id)) ? [] : [{ id: BigInt(id) }]),
          { ticket_code: id },
        ],
      },
      include: { category: true },
    });

    if (!report) {
      return apiError("NOT_FOUND", "Laporan tidak ditemukan", 404);
    }

    // Only owner citizen or staff can add media
    if (userRole === "CITIZEN" && report.reporter_id !== userId) {
      return apiError("FORBIDDEN", "Anda hanya dapat menambahkan foto pada laporan Anda sendiri", 403);
    }

    if (report.status === "RESOLVED" || report.status === "REJECTED" || report.status === "CANCELLED") {
      return apiError("FORBIDDEN", `Tidak dapat menambahkan foto pada laporan dengan status ${report.status}`, 403);
    }

    const formData = await req.formData();
    const mediaFiles = formData.getAll("media[]") as File[];

    if (!mediaFiles || mediaFiles.length === 0) {
      return apiError("VALIDATION_ERROR", "Minimal satu foto wajib diunggah", 422);
    }

    const createdMedia = [];
    for (const file of mediaFiles) {
      if (file && typeof file === "object" && file.size > 0) {
        const saved = await saveUploadedFile(file);
        const record = await db.reportMedia.create({
          data: {
            report_id: report.id,
            type: "IMAGE",
            storage_key: saved.storageKey,
            url: saved.url,
            mime_type: saved.mimeType,
            size_bytes: saved.sizeBytes,
            uploaded_by: userId,
          },
        });
        createdMedia.push({ id: record.id, storage_key: saved.storageKey, url: saved.url });

        // Trigger AI prediction if category is FLOOD
        if (report.category.requires_ai || report.category.code === "FLOOD") {
          triggerAiPrediction(record.id, saved.storageKey).catch((e) =>
            console.error("Async AI error:", e)
          );
        }
      }
    }

    // Record in status history
    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        from_status: report.status,
        to_status: report.status,
        changed_by: userId,
        note: `Pelapor menambahkan ${createdMedia.length} foto pendukung tambahan.`,
      },
    });

    return apiSuccess({
      message: `${createdMedia.length} foto tambahan berhasil diunggah`,
      media: createdMedia,
    });
  } catch (error) {
    console.error("POST /reports/[id]/media error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menambahkan foto laporan", 500);
  }
}

