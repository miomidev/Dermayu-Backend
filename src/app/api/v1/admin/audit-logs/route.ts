import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const logs = await db.auditLog.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        actor: {
          select: {
            id: true,
            public_id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return apiSuccess(logs);
  } catch (error) {
    console.error("GET /admin/audit-logs error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat log audit sistem", 500);
  }
}
