import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  getDbPoskoList,
  addDbPengungsi,
  updateDbPengungsi,
  deleteDbPengungsi,
} from "@/lib/serverDb";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

function resolveOfficerId(req: NextRequest, bodyUserId?: string): string {
  let id = bodyUserId || req.headers.get("x-user-id");
  if (!id) {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) id = payload.userId;
    }
  }
  return id || "petugas-01";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const poskoId = searchParams.get("poskoId");

    const all = getDbPoskoList();

    if (poskoId) {
      const posko = all.find((p) => p.id === poskoId);
      if (!posko) {
        return apiError("NOT_FOUND", "Posko tidak ditemukan", 404);
      }
      return apiSuccess({
        data: posko.pengungsi || [],
        meta: {
          poskoId: posko.id,
          poskoName: posko.nama,
          terisi: posko.pengungsi?.length || 0,
          kapasitas: posko.kapasitas,
        },
      });
    }

    // Mengumpulkan seluruh pengungsi lintas posko
    const allPengungsi = all.flatMap((p) =>
      (p.pengungsi || []).map((item) => ({ ...item, poskoId: p.id, poskoNama: p.nama }))
    );

    return apiSuccess({
      data: allPengungsi,
      meta: {
        total: allPengungsi.length,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/pengungsi error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil data pengungsi", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const officerId = resolveOfficerId(req, body.currentUserId);

    const { poskoId, nama, jenisKelamin, usia, alamatAsal, kondisiKesehatan, catatan } = body;

    if (!poskoId || !nama || !jenisKelamin) {
      return apiError("VALIDATION_ERROR", "poskoId, nama, dan jenisKelamin wajib diisi", 400);
    }

    const result = addDbPengungsi(
      poskoId,
      {
        nama,
        jenisKelamin,
        usia: Number(usia) || 0,
        alamatAsal: alamatAsal || "",
        kondisiKesehatan: kondisiKesehatan || "Sehat",
        catatan,
      },
      { id: officerId }
    );

    return apiSuccess({
      message: "Data pengungsi berhasil ditambahkan dan kapasitas posko diperbarui secara otomatis",
      data: result,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return apiError("FORBIDDEN", error.message, 403);
    }
    if (error.message?.includes("penuh")) {
      return apiError("BAD_REQUEST", error.message, 400);
    }
    console.error("POST /api/v1/pengungsi error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal menambah data pengungsi", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const officerId = resolveOfficerId(req, body.currentUserId);
    const { poskoId, pengungsiId, ...updates } = body;

    if (!poskoId || !pengungsiId) {
      return apiError("VALIDATION_ERROR", "poskoId dan pengungsiId wajib disertakan", 400);
    }

    const updatedPosko = updateDbPengungsi(poskoId, pengungsiId, updates, { id: officerId });

    return apiSuccess({
      message: "Data pengungsi berhasil diperbarui",
      data: updatedPosko,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return apiError("FORBIDDEN", error.message, 403);
    }
    console.error("PATCH /api/v1/pengungsi error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal memperbarui pengungsi", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const poskoId = searchParams.get("poskoId");
    const pengungsiId = searchParams.get("pengungsiId");

    const officerId = resolveOfficerId(req);

    if (!poskoId || !pengungsiId) {
      return apiError("VALIDATION_ERROR", "poskoId dan pengungsiId parameter wajib disertakan", 400);
    }

    const updatedPosko = deleteDbPengungsi(poskoId, pengungsiId, { id: officerId });

    return apiSuccess({
      message: "Data pengungsi berhasil dihapus dan kapasitas posko otomatis berkurang",
      data: updatedPosko,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return apiError("FORBIDDEN", error.message, 403);
    }
    console.error("DELETE /api/v1/pengungsi error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal menghapus pengungsi", 500);
  }
}

