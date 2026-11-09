import db from "@/lib/db";
import { NextRequest } from "next/server";
import { addAuditLogRecord } from "@/lib/serverDb";

interface LogAuditParams {
  req?: NextRequest;
  actorId?: bigint | string | number | null;
  actorName?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string | number | bigint | null;
  metadata?: Record<string, any> | string | null;
}

export async function recordAuditLog({
  req,
  actorId,
  actorName,
  actorRole,
  action,
  entityType,
  entityId,
  metadata,
}: LogAuditParams) {
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

  // Always write to persistent JSON store for high-availability fallback
  try {
    addAuditLogRecord({
      action,
      entity_type: entityType,
      entity_id: entityId !== undefined && entityId !== null ? String(entityId) : null,
      ip: ip || "127.0.0.1",
      user_agent: userAgent || "Dermayu-Audit/2.0",
      metadata: metadataStr,
      actor: {
        id: String(actorId || "1"),
        public_id: `USR-${actorId || "01"}`,
        full_name: actorName || "Super Admin DERMAYU",
        email: "superadmin@dermayu.id",
        role: actorRole || "SUPERADMIN",
      },
    });
  } catch (err) {
    console.warn("Audit file store warning:", err);
  }

  // Try DB persistence
  try {
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
    // If DB is offline/unseeded, file fallback was already recorded
  }
}
