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

    const [
      totalReports,
      pendingVerification,
      inProgress,
      resolved,
      criticalCount,
      totalUsers,
      totalAlerts,
      categoriesCount,
    ] = await Promise.all([
      db.report.count(),
      db.report.count({ where: { status: "SUBMITTED" } }),
      db.report.count({
        where: { status: { in: ["VERIFIED", "ASSIGNED", "IN_PROGRESS"] } },
      }),
      db.report.count({ where: { status: "RESOLVED" } }),
      db.report.count({
        where: {
          severity: "CRITICAL",
          status: { notIn: ["RESOLVED", "REJECTED", "CANCELLED"] },
        },
      }),
      db.user.count({ where: { role: "CITIZEN" } }),
      db.alert.count({ where: { status: "ACTIVE" } }),
      db.report.groupBy({
        by: ["category_id"],
        _count: { id: true },
      }),
    ]);

    // Fetch category names for breakdown
    const categories = await db.reportCategory.findMany();
    const categoryMap = new Map(categories.map((c) => [c.id.toString(), c.name]));

    const categoryBreakdown = categoriesCount.map((item) => ({
      categoryId: item.category_id.toString(),
      name: categoryMap.get(item.category_id.toString()) || "Lainnya",
      count: item._count.id,
    }));

    return apiSuccess({
      stats: {
        totalReports,
        pendingVerification,
        inProgress,
        resolved,
        criticalCount,
        totalCitizens: totalUsers,
        activeAlerts: totalAlerts,
      },
      categoryBreakdown,
    });
  } catch (error) {
    console.error("GET /admin/stats/overview error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat statistik admin", 500);
  }
}
