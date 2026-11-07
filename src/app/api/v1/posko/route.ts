import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getDbPoskoList, createDbPosko } from "@/lib/serverDb";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "warga";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const district = searchParams.get("district") || "SEMUA";
    const status = searchParams.get("status") || "SEMUA";
    const search = searchParams.get("search") || "";

    const all = getDbPoskoList();

    // ATURAN VISIBILITAS:
    // Pada endpoint Warga, WAJIB filter WHERE isActive = true
    // Pada endpoint Petugas, tampilkan semua, posko nonaktif selalu diurutkan di paling bawah
    let items =
      role === "petugas"
        ? [...all].sort((a, b) => {
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            return 0;
          })
        : all.filter((p) => p.isActive === true);

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.nama.toLowerCase().includes(q) ||
          p.alamat.toLowerCase().includes(q) ||
          p.kecamatan.toLowerCase().includes(q)
      );
    }

    if (district !== "SEMUA" && district !== "ALL") {
      items = items.filter((p) => p.kecamatan.toLowerCase() === district.toLowerCase());
    }

    if (status !== "SEMUA") {
      items = items.filter((p) => p.status === status);
    }

    const total = items.length;

    // Jika page/limit diberikan, lakukan pagination. Jika tidak, kembalikan semua data untuk Peta / Manajemen
    if (pageParam && limitParam) {
      const page = parseInt(pageParam, 10) || 1;
      const limit = parseInt(limitParam, 10) || 10;
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
    }

    return apiSuccess({
      data: items,
      meta: {
        total,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/posko error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil data posko", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
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

    if (!body.nama || !body.alamat || !body.kecamatan) {
      return apiError("VALIDATION_ERROR", "Nama, alamat, dan kecamatan posko wajib diisi", 400);
    }

    const newPosko = createDbPosko(body, { id: currentUserId });

    return apiSuccess({
      message: "Posko evakuasi berhasil ditambahkan ke database",
      data: newPosko,
    });
  } catch (error: any) {
    console.error("POST /api/v1/posko error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal membuat posko", 500);
  }
}
