import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getAllPosko, updatePosko, deletePosko, toggleActivePosko } from "@/utils/poskoService";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Dapatkan current user ID
    let currentUserId = body.currentUserId;
    if (!currentUserId) {
      const token = extractBearerToken(req.headers.get("authorization"));
      if (token) {
        const payload = verifyAccessToken(token);
        if (payload) currentUserId = payload.userId;
      }
    }
    if (!currentUserId) {
      currentUserId = req.headers.get("x-user-id") || "petugas-01";
    }

    const all = getAllPosko();
    const posko = all.find((p) => p.id === id);
    if (!posko) {
      return apiError("NOT_FOUND", "Posko tidak ditemukan", 404);
    }

    // ATURAN 3: Validasi Backend (Petugas HANYA diizinkan mengedit posko yang dibuat sendiri)
    if (posko.petugasId !== currentUserId) {
      return apiError(
        "FORBIDDEN",
        "Unauthorized: Petugas hanya diizinkan mengedit posko yang dibuat sendiri",
        403
      );
    }

    let updated;
    if (body.toggleActive) {
      updated = toggleActivePosko(id, { id: currentUserId });
    } else {
      updated = updatePosko(id, body, { id: currentUserId });
    }

    return apiSuccess({
      message: "Posko berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return apiError("FORBIDDEN", error.message, 403);
    }
    console.error("PATCH /api/v1/posko/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperbarui posko", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let currentUserId = req.headers.get("x-user-id");
    if (!currentUserId) {
      const token = extractBearerToken(req.headers.get("authorization"));
      if (token) {
        const payload = verifyAccessToken(token);
        if (payload) currentUserId = payload.userId;
      }
    }
    if (!currentUserId) {
      currentUserId = "petugas-01";
    }

    const all = getAllPosko();
    const posko = all.find((p) => p.id === id);
    if (!posko) {
      return apiError("NOT_FOUND", "Posko tidak ditemukan", 404);
    }

    // ATURAN 3: Validasi Backend (Petugas HANYA diizinkan menghapus posko yang dibuat sendiri)
    if (posko.petugasId !== currentUserId) {
      return apiError(
        "FORBIDDEN",
        "Unauthorized: Petugas hanya diizinkan menghapus posko yang dibuat sendiri",
        403
      );
    }

    // ATURAN 4: Soft-Delete
    deletePosko(id, { id: currentUserId });

    return apiSuccess({
      message: "Posko berhasil dinonaktifkan (soft-delete)",
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return apiError("FORBIDDEN", error.message, 403);
    }
    console.error("DELETE /api/v1/posko/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menghapus posko", 500);
  }
}

