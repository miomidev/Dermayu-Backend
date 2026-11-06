import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getAllPosko, getWargaPosko } from "@/utils/poskoService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "warga";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const district = searchParams.get("district") || "SEMUA";
    const status = searchParams.get("status") || "SEMUA";
    const search = searchParams.get("search") || "";

    // ATURAN 4: Filter Visibilitas Warga
    // Pada endpoint Warga, WAJIB filter WHERE isActive = true
    let items = role === "petugas" ? getAllPosko() : getWargaPosko();

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.nama.toLowerCase().includes(q) ||
          p.alamat.toLowerCase().includes(q) ||
          p.kecamatan.toLowerCase().includes(q)
      );
    }

    if (district !== "SEMUA") {
      items = items.filter((p) => p.kecamatan.toLowerCase() === district.toLowerCase());
    }

    if (status !== "SEMUA") {
      items = items.filter((p) => p.status === status);
    }

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginated = items.slice(startIndex, startIndex + limit);

    return apiSuccess({
      data: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/v1/posko error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil data posko", 500);
  }
}

