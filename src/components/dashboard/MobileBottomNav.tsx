"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForkedRouteIcon, BeaconAlertIcon, PoskoShelterIcon } from "@/components/ui/Icons";
import {
  Home,
  LayoutDashboard,
  ClipboardList,
  Map,
  Activity,
  Users,
} from "lucide-react";
import React from "react";
import { getActiveSession } from "@/utils/authSession";

export interface MobileBottomNavProps {
  role?: "warga" | "petugas" | "WARGA" | "PETUGAS" | string;
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isForceHidden, setIsForceHidden] = React.useState(false);

  // Deteksi role aktif berdasarkan prop atau auth session tersimpan
  const session = typeof window !== "undefined" ? getActiveSession() : null;
  const rawRole = (role || session?.role || "warga").toString().toLowerCase();
  const isPetugas =
    rawRole.includes("petugas") ||
    rawRole.includes("officer") ||
    rawRole.includes("admin");
  const activeRole: "warga" | "petugas" = isPetugas ? "petugas" : "warga";

  React.useEffect(() => {
    const checkNavVisibility = () => {
      setIsForceHidden(document.body.classList.contains("hide-mobile-nav"));
    };
    checkNavVisibility();

    const observer = new MutationObserver(checkNavVisibility);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // 1. Warga Bottom Nav Items (TETAP UTUH & TIDAK DIUBAH SAMA SEKALI)
  const wargaNavItems = [
    {
      label: "Beranda",
      href: "/warga/dashboard",
      icon: Home,
    },
    {
      label: "Rute",
      href: "/warga/evakuasi",
      icon: ForkedRouteIcon,
    },
    {
      label: "Lapor",
      href: "/warga/lapor",
      icon: BeaconAlertIcon,
    },
    {
      label: "Posko",
      href: "/warga/posko",
      icon: PoskoShelterIcon,
    },
    {
      label: "Komunitas",
      href: "/warga/komunitas",
      icon: Users,
    },
  ];

  // 2. Petugas Bottom Nav Items (Dengan Unified Warga-Style Layout Flat & Sejajar)
  const petugasNavItems = [
    {
      label: "Dasbor",
      href: "/petugas/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Triage",
      href: "/petugas/triage",
      icon: ClipboardList,
    },
    {
      label: "Peta SAR",
      href: "/petugas/peta-sar",
      icon: Map,
    },
    {
      label: "Posko",
      href: "/petugas/posko",
      icon: PoskoShelterIcon,
    },
    {
      label: "Telemetri",
      href: "/petugas/telemetri",
      icon: Activity,
    },
  ];

  const items = activeRole === "petugas" ? petugasNavItems : wargaNavItems;

  const isItemActive = (href: string) => {
    if (href === "/warga/dashboard") {
      return (
        pathname === "/warga/dashboard" ||
        pathname === "/dashboard" ||
        pathname === "/warga" ||
        pathname === "/"
      );
    }
    if (href === "/petugas/dashboard") {
      return pathname === "/petugas/dashboard" || pathname === "/petugas";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  if (isForceHidden) return null;

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] block md:hidden select-none touch-manipulation pb-safe"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="grid grid-cols-5 items-center px-2 h-16 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = isItemActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              replace
              scroll={false}
              className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive
                  ? "text-[#38746D]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive
                    ? "stroke-[2.3] text-[#38746D] fill-current scale-105"
                    : "stroke-[1.9] text-slate-500 fill-none"
                }`}
              />
              <span
                className={`text-[11px] tracking-tight leading-tight mt-1 text-center truncate max-w-[68px] ${
                  isActive
                    ? "font-bold text-[#38746D]"
                    : "font-normal text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Alias export untuk kompatibilitas modular BottomNavBar
export const BottomNavBar = MobileBottomNav;
export default MobileBottomNav;
