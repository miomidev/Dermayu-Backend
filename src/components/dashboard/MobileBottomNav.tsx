"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForkedRouteIcon, BeaconAlertIcon, PoskoShelterIcon } from "@/components/ui/Icons";
import {
  Home,
  User,
  LayoutDashboard,
  ClipboardList,
  Map,
  Activity,
  Users,
} from "lucide-react";
import React from "react";

interface MobileBottomNavProps {
  role: "warga" | "petugas";
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isForceHidden, setIsForceHidden] = React.useState(false);

  React.useEffect(() => {
    const checkNavVisibility = () => {
      setIsForceHidden(document.body.classList.contains("hide-mobile-nav"));
    };
    checkNavVisibility();

    const observer = new MutationObserver(checkNavVisibility);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Warga Bottom Nav Items (Sama rata & seimbang: Beranda -> Rute -> Lapor -> Posko -> Komunitas)
  const wargaNavItems = [
    {
      label: "Beranda",
      href: "/warga/dashboard",
      icon: Home,
      isCenter: false,
    },
    {
      label: "Rute",
      href: "/warga/evakuasi",
      icon: ForkedRouteIcon,
      isCenter: false,
    },
    {
      label: "Lapor",
      href: "/warga/lapor",
      icon: BeaconAlertIcon,
      isCenter: false,
    },
    {
      label: "Posko",
      href: "/warga/posko",
      icon: PoskoShelterIcon,
      isCenter: false,
    },
    {
      label: "Komunitas",
      href: "/warga/komunitas",
      icon: Users,
      isCenter: false,
    },
  ];

  // Petugas Bottom Nav Items (Tim Reaksi Cepat BPBD)
  const petugasNavItems = [
    {
      label: "Dasbor",
      href: "/petugas/dashboard",
      icon: LayoutDashboard,
      isCenter: false,
    },
    {
      label: "Triage",
      href: "/petugas/triage",
      icon: ClipboardList,
      isCenter: false,
    },
    {
      label: "Peta SAR",
      href: "/admin/dashboard",
      icon: Map,
      isCenter: true,
    },
    {
      label: "Posko",
      href: "/petugas/posko",
      icon: Home,
      isCenter: false,
    },
    {
      label: "Telemetri",
      href: "/petugas/telemetri",
      icon: Activity,
      isCenter: false,
    },
  ];

  const items = role === "petugas" ? petugasNavItems : wargaNavItems;

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

          // 1. Center Floating Action Button (FAB) jika diaktifkan (misal pada role petugas)
          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                replace
                scroll={false}
                className="relative -top-3 flex flex-col items-center justify-center group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-[#0E3D2D] text-white shadow-lg shadow-[#0E3D2D]/40 scale-105"
                      : "bg-[#0E3D2D] text-white hover:bg-[#155E45] shadow-lg shadow-[#0E3D2D]/30"
                  }`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span
                  className={`text-[11px] mt-1 tracking-tight text-center leading-none transition-colors ${
                    isActive
                      ? "font-semibold text-[#0E3D2D]"
                      : "font-medium text-slate-600 group-hover:text-[#0E3D2D]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          // 2. Regular Tab Navigation Items (Sama rata & seimbang)
          return (
            <Link
              key={item.href}
              href={item.href}
              replace
              scroll={false}
              className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive
                  ? "text-[#0E3D2D]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive
                    ? "stroke-[2.3] text-[#0E3D2D] scale-105"
                    : "stroke-[1.9] text-slate-500"
                }`}
              />
              <span
                className={`text-[11px] tracking-tight leading-tight mt-1 text-center truncate max-w-[68px] ${
                  isActive
                    ? "font-semibold text-[#0E3D2D]"
                    : "font-medium text-slate-500"
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
