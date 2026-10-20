import { NextResponse } from "next/server";
import db from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";


export async function GET() {
  try {
    const categories = await db.reportCategory.findMany({
      where: { is_active: true },
      orderBy: { id: "asc" },
    });

    return apiSuccess(categories);
  } catch (error) {
    console.error("GET /categories error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil daftar kategori", 500);
  }
}
