import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  getDbPoskoList,
  updateDbPosko,
  deleteDbPosko,
  toggleActiveDbPosko,
} from "@/lib/serverDb";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const all = getDbPoskoList();
    const posko = all.find((p) => p.id === id);
    if (!posko) {
      return apiError("NOT_FOUND", "Posko tidak ditemukan", 404);
    }
    return apiSuccess({ data: posko });
  } catch (error) {
    console.error("GET /api/v1/posko/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil data posko", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    let currentUserId = body.currentUserId || req.headers.get("x-user-id");
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

    const all = getDbPoskoList();
    const posko = all.find((p) => p.id === id);
    if (!posko) {
      return apiError("NOT_FOUND", "Posko tidak ditemukan", 404);
    }

    // ATURAN OTORISASI: Petugas HANYA diizinkan mengedit posko yang dibuat sendiri
    if (posko.petugasId !== currentUserId) {
      return apiError(
        "FORBIDDEN",
        "Unauthorized: Petugas hanya diizinkan mengedit posko yang dibuat sendiri",
        403
      );
    }

    let updated;
    if (body.toggleActive) {
      updated = toggleActiveDbPosko(id, { id: currentUserId });
    } else {
      updated = updateDbPosko(id, body, { id: currentUserId });
    }

    return apiSuccess({
      message: "Posko berhasil diperbarui di database",
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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
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

    const all = getDbPoskoList();
    const posko = all.find((p) => p.id === id);
    if (!posko) {
      return apiError("NOT_FOUND", "Posko tidak ditemukan", 404);
    }

    // ATURAN OTORISASI: Petugas HANYA diizinkan menghapus posko miliknya sendiri
    if (posko.petugasId !== currentUserId) {
      return apiError(
        "FORBIDDEN",
        "Unauthorized: Petugas hanya diizinkan menghapus posko yang dibuat sendiri",
        403
      );
    }

    // Soft-Delete: set isActive = false
    const updated = deleteDbPosko(id, { id: currentUserId });

    return apiSuccess({
      message: "Posko berhasil dinonaktifkan (soft-delete)",
      data: updated,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return apiError("FORBIDDEN", error.message, 403);
    }
    console.error("DELETE /api/v1/posko/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menghapus posko", 500);
  }
}
