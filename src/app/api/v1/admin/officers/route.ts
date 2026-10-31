import { NextRequest, connection } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connection();
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) {
      return apiError("UNAUTHORIZED", "Token autentikasi diperlukan", 401);
    }

    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPERADMIN")) {
      return apiError("FORBIDDEN", "Akses hanya untuk Admin atau Superadmin", 403);
    }

    const officers = await db.user.findMany({
      where: {
        role: "OFFICER",
        is_active: true,
      },
      select: {
        id: true,
        public_id: true,
        full_name: true,
        email: true,
        phone: true,
      },
      orderBy: { full_name: "asc" },
    });

    return apiSuccess(officers);
  } catch (error) {
    console.error("GET /admin/officers error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat daftar petugas", 500);
  }
}
