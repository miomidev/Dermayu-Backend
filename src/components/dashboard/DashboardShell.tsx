"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
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
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);

  // Close mobile sidebar on route change & touch activity
  useEffect(() => {
    setMobileMenuOpen(false);
    touchDashboardActivity();
  }, [pathname]);

  // Load saved sidebar preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dermayu_sidebar_collapsed");
      if (saved !== null) {
        setDesktopCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleDesktopSidebar = () => {
    setDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dermayu_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        const active = document.activeElement;
        const isInput =
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          active?.getAttribute("contenteditable") === "true";

        if (!isInput) {
          e.preventDefault();
          toggleDesktopSidebar();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col md:flex-row antialiased">
      {/* 1. SIDEBAR HIJAU DEEP TEAL */}
      <AppSidebar
        role={role}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        collapsed={desktopCollapsed}
        onToggleCollapse={toggleDesktopSidebar}
      />

      {/* 2. AREA KONTEN UTAMA DENGAN PERSISTENT TOP HEADER */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-[margin] duration-300 ease-in-out ${
          desktopCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <AppHeader
          role={role}
          session={session}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Content Canvas (Hanya bagian ini yang berganti saat navigasi) */}
        <main
          className={`flex-1 min-w-0 flex flex-col ${
            pathname === "/warga/evakuasi"
              ? "p-0 pb-0 md:p-6 lg:p-8 md:pb-8"
              : "p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8"
          }`}
        >
          {children}
        </main>
      </div>

      {/* 3. NAVBAR MOBILE DI BAWAH (MD:HIDDEN) */}
      <MobileBottomNav role={role} />
    </div>
  );
}

