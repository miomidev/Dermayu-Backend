"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Home,
  AlertCircle,
  Users,
  PhoneCall,
  LayoutDashboard,
  ClipboardList,
  Map,
  Activity,
} from "lucide-react";

interface MobileBottomNavProps {
  role: "warga" | "petugas";
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Warga Bottom Nav Items (5 Aksi Prioritas Warga)
  const wargaNavItems = [
    {
      label: "Dasbor",
      href: "/warga/dashboard",
      icon: ShieldCheck,
      isCenter: false,
    },
    {
      label: "Posko",
      href: "/warga/posko",
      icon: Home,
      isCenter: false,
    },
    {
      label: "Lapor",
      href: "/warga/lapor",
      icon: AlertCircle,
      isCenter: true,
    },
    {
      label: "Warga",
      href: "/warga/komunitas",
      icon: Users,
      isCenter: false,
    },
    {
      label: "Kontak 112",
      href: "/warga/kontak",
      icon: PhoneCall,
      isCenter: false,
    },
  ];

  // Petugas Bottom Nav Items (5 Aksi Prioritas Tim Reaksi Cepat BPBD)
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

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#D5E4E0] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden select-none touch-manipulation"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-1.5 h-16 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          // Elevated Center Action Button
          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3.5 flex flex-col items-center justify-center shrink-0 group cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all active:scale-90 border-[3px] border-white ${
                    isActive
                      ? "bg-rose-700 text-white shadow-rose-700/30 ring-2 ring-rose-500 scale-105"
                      : "bg-[#1D443F] text-white hover:bg-[#24544E] shadow-[#1D443F]/30"
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.4]" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight text-center leading-none ${
                    isActive ? "text-rose-700" : "text-[#1D443F]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          // Regular Tab Items
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
                isActive ? "text-[#1D443F]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`flex items-center justify-center px-3 py-1 rounded-full transition-all ${
                  isActive ? "bg-[#EEF5F3]" : "bg-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive
                      ? "stroke-[2.4] text-[#1D443F] scale-105"
                      : "stroke-[1.8]"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] tracking-tight leading-tight mt-0.5 text-center truncate max-w-[64px] ${
                  isActive
                    ? "font-extrabold text-[#1D443F]"
                    : "font-semibold text-gray-500"
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
