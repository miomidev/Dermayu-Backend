import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  updateCitizenReportStatus,
  deleteCitizenReport,
  updateDbReportStatus,
  deleteDbReport,
} from "@/lib/serverDb";

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

    // Try citizen reports first
    const citizenUpdated = updateCitizenReportStatus(id, body.status, {
      rejectionReason: body.rejectionReason,
      assignedUnit: body.assignedUnit,
    });

    if (citizenUpdated) {
      return apiSuccess({
        message: "Status laporan warga berhasil diperbarui di database",
        data: citizenUpdated,
      });
    }

    // Fallback to obstacle reports
    const dbUpdated = updateDbReportStatus(id, body.status);
    if (!dbUpdated) {
      return apiError("NOT_FOUND", "Laporan genangan tidak ditemukan", 404);
    }

    return apiSuccess({
      message: "Status laporan berhasil diperbarui di database",
      data: dbUpdated,
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
    const citizenSuccess = deleteCitizenReport(id);
    if (citizenSuccess) {
      return apiSuccess({
        message: "Laporan warga berhasil dihapus dari database",
      });
    }

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
