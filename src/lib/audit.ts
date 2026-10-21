import db from "@/lib/db";
import { NextRequest } from "next/server";

interface LogAuditParams {
  req?: NextRequest;
  actorId?: bigint | string | number | null;
  action: string;
  entityType: string;
  entityId?: string | number | bigint | null;
  metadata?: Record<string, any> | string | null;
}

export async function recordAuditLog({
  req,
  actorId,
  action,
  entityType,
  entityId,
  metadata,
}: LogAuditParams) {
  try {
    let ip: string | null = null;
    let userAgent: string | null = null;

    if (req) {
      const forwarded = req.headers.get("x-forwarded-for");
      ip = (forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip")) || null;
      userAgent = req.headers.get("user-agent") || null;
    }

    const metadataStr =
      typeof metadata === "object" && metadata !== null
        ? JSON.stringify(metadata)
        : metadata || null;

    const parsedActorId =
      actorId !== undefined && actorId !== null ? BigInt(actorId) : null;

    await db.auditLog.create({
      data: {
        actor_id: parsedActorId,
        action,
        entity_type: entityType,
        entity_id: entityId !== undefined && entityId !== null ? String(entityId) : null,
        ip: ip ? ip.slice(0, 50) : null,
        user_agent: userAgent ? userAgent.slice(0, 255) : null,
        metadata: metadataStr,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}
