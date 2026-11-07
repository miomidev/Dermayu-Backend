import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { updateDbReportStatus, deleteDbReport } from "@/lib/serverDb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.status) {
      return apiError("VALIDATION_ERROR", "Field status wajib diisi", 400);
    }

    const updated = updateDbReportStatus(id, body.status);
    if (!updated) {
      return apiError("NOT_FOUND", "Laporan genangan tidak ditemukan", 404);
    }

    return apiSuccess({
      message: "Status laporan berhasil diperbarui di database",
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/v1/laporan/[id] error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal memperbarui status laporan", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteDbReport(id);
    if (!success) {
      return apiError("NOT_FOUND", "Laporan genangan tidak ditemukan", 404);
    }

    return apiSuccess({
      message: "Laporan genangan berhasil dihapus dari database",
    });
  } catch (error: any) {
    console.error("DELETE /api/v1/laporan/[id] error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal menghapus laporan", 500);
  }
}

