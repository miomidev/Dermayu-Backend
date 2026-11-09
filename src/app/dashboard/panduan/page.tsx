"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveSession, type UserSession } from "@/utils/authSession";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BukuPanduanView } from "@/components/dashboard/BukuPanduanView";

export default function DashboardPanduanPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getActiveSession();
    if (!s) {
      router.replace("/login?redirect=/warga/panduan");
      return;
    }
    setSession(s);
    setLoading(false);
    // Redirect cleanly ke rute role spesifik
    const isOfficer =
      s.role === "petugas" ||
      s.role === "OFFICER" ||
      s.role === "superadmin" ||
      s.role === "SUPERADMIN";
    if (isOfficer) {
      router.replace("/petugas/panduan");
    } else {
      router.replace("/warga/panduan");
    }
  }, [router]);

  if (loading || !session) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#38746D] border-t-transparent animate-spin" />
      </div>
    );
  }

  const normalizedRole: "warga" | "petugas" =
    session.role === "petugas" ||
    session.role === "OFFICER" ||
    session.role === "superadmin" ||
    session.role === "SUPERADMIN"
      ? "petugas"
      : "warga";

  return (
    <DashboardShell role={normalizedRole}>
      <BukuPanduanView forcedRole={normalizedRole} />
    </DashboardShell>
  );
}
