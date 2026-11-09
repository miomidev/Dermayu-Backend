import { getActiveSession } from "./authSession";

let lastTrackedPath: string | null = null;
let lastTrackedTime = 0;

export function trackFeatureAccess(
  role: "warga" | "petugas",
  featureName: string,
  pathname: string
) {
  if (typeof window === "undefined") return;

  const now = Date.now();
  // Prevent duplicate spam within 3 seconds for the exact same path
  if (lastTrackedPath === pathname && now - lastTrackedTime < 3000) {
    return;
  }
  lastTrackedPath = pathname;
  lastTrackedTime = now;

  const session = getActiveSession();
  const actorName = session?.name || (role === "petugas" ? "Petugas Lapangan" : "Warga Indramayu");
  const actorRole = (session?.role || (role === "petugas" ? "OFFICER" : "CITIZEN")).toUpperCase();
  const entityType = role === "petugas" ? "PORTAL_PETUGAS" : "PORTAL_WARGA";

  try {
    fetch("/api/v1/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "FEATURE_ACCESS",
        entity_type: entityType,
        entity_id: pathname,
        metadata: `${actorName} membuka modul ${featureName} (${pathname})`,
        actor: {
          id: String(session?.id || "anon"),
          public_id: (session as any)?.publicId || (session?.id ? `USR-${session.id}` : (role === "petugas" ? "TRC-OFFICER" : "WRG-CITIZEN")),
          full_name: actorName,
          email: session?.email || (role === "petugas" ? "petugas@dermayu.id" : "warga@dermayu.id"),
          role: actorRole,
        },
      }),
    }).catch(() => {});
  } catch {}
}

export function trackFeatureInteraction(
  action: string,
  featureName: string,
  details?: string
) {
  if (typeof window === "undefined") return;

  const session = getActiveSession();
  const role = (session?.role || "CITIZEN").toUpperCase();
  const actorName = session?.name || (role === "OFFICER" ? "Petugas Lapangan" : "Warga Indramayu");

  try {
    fetch("/api/v1/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        entity_type: "INTERACTION",
        entity_id: featureName,
        metadata: details || `${actorName} melakukan aksi pada ${featureName}`,
        actor: {
          id: String(session?.id || "anon"),
          public_id: (session as any)?.publicId || (session?.id ? `USR-${session.id}` : "USER-ACTOR"),
          full_name: actorName,
          email: session?.email || "user@dermayu.id",
          role,
        },
      }),
    }).catch(() => {});
  } catch {}
}
