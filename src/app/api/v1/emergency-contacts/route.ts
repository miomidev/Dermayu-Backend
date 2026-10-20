import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";


export async function GET() {
  try {
    const contacts = await db.emergencyContact.findMany({
      where: { is_active: true },
      orderBy: { sort_order: "asc" },
    });

    return apiSuccess(contacts);
  } catch (error) {
    console.error("GET /emergency-contacts error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil kontak darurat", 500);
  }
}
