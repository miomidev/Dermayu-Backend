"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { AppHeader } from "@/components/dashboard/AppHeader";
import {
  getActiveSession,
  touchDashboardActivity,
  type UserSession,
} from "@/utils/authSession";

export interface DashboardShellProps {
  role: "warga" | "petugas";
  children: React.ReactNode;
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);

  // Close mobile sidebar on route change & touch activity
  useEffect(() => {
    setMobileMenuOpen(false);
    touchDashboardActivity();
  }, [pathname]);

  // Session Synchronization (Single Source of Truth)
  useEffect(() => {
    const syncSession = () => {
      const active = getActiveSession();
      if (active) {
        setSession(active);
      } else {
        setSession({
          name: role === "petugas" ? "Petugas BPBD" : "Warga Indramayu",
          email: role === "petugas" ? "petugas@dermayu.id" : "warga@dermayu.id",
          role: role,
          lastDashboardActive: Date.now(),
        });
      }
    };

    syncSession();

    window.addEventListener("dermayu_session_updated", syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("dermayu_session_updated", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, [role]);

  // Session Heartbeat: Saat user berada di dalam dashboard, session tidak boleh expired
  useEffect(() => {
    touchDashboardActivity();

    // Heartbeat setiap 1 menit saat aktif di dashboard
    const heartbeatInterval = setInterval(() => {
      touchDashboardActivity();
    }, 60 * 1000);

    // Event listener interaksi pengguna (throttled 30s)
    let lastTouch = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastTouch > 30 * 1000) {
        lastTouch = now;
        touchDashboardActivity();
      }
    };

    window.addEventListener("click", handleUserActivity, { passive: true });
    window.addEventListener("keydown", handleUserActivity, { passive: true });
    window.addEventListener("scroll", handleUserActivity, { passive: true });

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col md:flex-row antialiased select-none">
      {/* 1. SIDEBAR HIJAU DEEP TEAL */}
      <AppSidebar
        role={role}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. AREA KONTEN UTAMA DENGAN PERSISTENT TOP HEADER */}
      <div className="md:ml-64 flex-1 flex flex-col min-w-0 min-h-screen">
        <AppHeader
          role={role}
          session={session}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Content Canvas (Hanya bagian ini yang berganti saat navigasi) */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

