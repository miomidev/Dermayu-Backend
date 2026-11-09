import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { getAuditLogs, addAuditLogRecord } from "@/lib/serverDb";

export async function GET(req: NextRequest) {
  // If authorization succeeds, try to fetch from DB
  const auth = authorize(req, Roles.ADMINS);
  if (auth.ok) {
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

      if (logs && logs.length > 0) {
        return apiSuccess(logs);
      }
    } catch (dbErr) {
      console.warn("DB findMany auditLog failed, falling back to serverDb:", dbErr);
    }
  }

  // Graceful fallback: return serverDb audit logs
  try {
    const fallbackLogs = getAuditLogs();
    return apiSuccess(fallbackLogs);
  } catch (error) {
    console.error("GET /admin/audit-logs error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat log audit sistem", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, entity_type, entity_id, metadata, actor } = body;
    if (!action || !entity_type) {
      return apiError("BAD_REQUEST", "action and entity_type are required", 400);
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = (forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip")) || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "DermayuAdmin/2.0";

    const record = addAuditLogRecord({
      action,
      entity_type,
      entity_id: entity_id || null,
      ip,
      user_agent: userAgent,
      metadata: typeof metadata === "object" ? JSON.stringify(metadata) : metadata,
      actor: actor || {
        id: "u-1",
        public_id: "ADM-001",
        full_name: "Super Admin DERMAYU",
        email: "superadmin@dermayu.id",
        role: "SUPERADMIN",
      },
    });

    return apiSuccess(record);
  } catch (err: any) {
    console.error("POST /admin/audit-logs error:", err);
    return apiError("INTERNAL_ERROR", "Gagal mencatat log audit", 500);
  }
}

