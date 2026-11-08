"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { getActiveSession } from "@/utils/authSession";

// ==================== PETUGAS & WARGA BOTTOM NAV ICONS ====================

// 1. Dashboard Icons
function DashboardOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="7" x="3" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="14" rx="1.5" />
      <rect width="7" height="7" x="3" y="14" rx="1.5" />
    </svg>
  );
}

function DashboardSolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect width="7.5" height="7.5" x="2.5" y="2.5" rx="2" />
      <rect width="7.5" height="7.5" x="14" y="2.5" rx="2" />
      <rect width="7.5" height="7.5" x="14" y="14" rx="2" />
      <rect width="7.5" height="7.5" x="2.5" y="14" rx="2" />
    </svg>
  );
}

// 2. Map / Peta SAR Icons
function MapOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.12 3.88 9 6.25 3.5 3.5v14.5l5.5 2.75 5.12-2.37L20.5 21V6.5l-6.38-2.62z" />
      <path d="M9 6.25v14.5" />
      <path d="M14.62 3.63v14.5" />
    </svg>
  );
}

function MapSolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.5 3.5v14.5l5.2 2.6V6.1L3.5 3.5z" opacity="0.9" />
      <path d="M9.3 6.1v14.5l5.4-2.5V3.6L9.3 6.1z" />
      <path d="M15.3 3.6v14.5l5.2 2.6V6.2l-5.2-2.6z" opacity="0.85" />
      <circle cx="12" cy="11" r="2.2" fill="white" />
    </svg>
  );
}

// 3. Triage Icons
function TriageOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="8" height="4" x="8" y="2" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M10 12h5" />
      <path d="M10 16h5" />
      <circle cx="7.5" cy="12" r="0.8" fill="currentColor" />
      <circle cx="7.5" cy="16" r="0.8" fill="currentColor" />
    </svg>
  );
}

function TriageSolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect width="16" height="19" x="4" y="3.5" rx="3" fill="currentColor" />
      <rect width="8" height="4" x="8" y="1.5" rx="1.5" fill="#1D443F" stroke="white" strokeWidth="1" />
      <path d="M10 11.5h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 15.5h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="7.5" cy="11.5" r="1.1" fill="white" />
      <circle cx="7.5" cy="15.5" r="1.1" fill="white" />
    </svg>
  );
}

// 4. Posko Icons
function PoskoShelterOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 9.5L8 4l5.5 5.5V20H2.5V9.5z" />
      <path d="M7 13.5h2v6.5H7z" />
      <path d="M12.5 4l5 5V20" />
      <path d="M16.5 4l5 5V20" />
    </svg>
  );
}

function PoskoShelterSolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M16.5 4.5l5 5V20h-3.5V8.5L16.5 4.5z" fill="currentColor" opacity="0.65" />
      <path d="M12.5 4.5l5 5V20h-3.5V8.5L12.5 4.5z" fill="currentColor" opacity="0.85" />
      <path d="M2.5 9.5L8 4l5.5 5.5V20H2.5V9.5z" fill="currentColor" />
      <rect x="7" y="13.5" width="2.2" height="6.5" rx="0.5" fill="white" />
    </svg>
  );
}

// 5. Telemetri Icons
function TelemetriOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function TelemetriSolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M22 12h-4l-3 9L9 3l-3 9H2"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <circle cx="9" cy="3" r="2" fill="currentColor" />
      <circle cx="15" cy="21" r="2" fill="currentColor" />
    </svg>
  );
}

// 6. Home Icons (Warga)
function HomeOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function HomeSolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" />
      <rect x="9.5" y="13" width="5" height="9" rx="1" fill="white" />
    </svg>
  );
}

// 7. Users Icons (Warga)
function UsersOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UsersSolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// 8. Rute Icons (Warga)
function RuteOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21v-6.5" />
      <path d="M12 14.5c-1.8 0-3.8-1.5-3.8-4.5V7" strokeDasharray="2.2 2.2" />
      <path d="M5.8 8.8L8.2 6.2l2.4 2.6" />
      <path d="M12 14.5c1.8 0 3.8-1.5 3.8-4.5V7" />
      <path d="M13.4 8.8L15.8 6.2l2.4 2.6" />
    </svg>
  );
}

function RuteSolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21v-6.5" />
      <path d="M12 14.5c-1.8 0-3.8-1.5-3.8-4.5V7" />
      <path d="M5.8 8.8L8.2 6.2l2.4 2.6" />
      <path d="M12 14.5c1.8 0 3.8-1.5 3.8-4.5V7" />
      <path d="M13.4 8.8L15.8 6.2l2.4 2.6" />
    </svg>
  );
}

// 9. Lapor Icons (Warga)
function LaporOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M8 7 A 7.5 7.5 0 1 0 16 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M9.5 9.8 A 4.3 4.3 0 1 0 14.5 9.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="13.5" r="1.3" fill="currentColor" />
      <path d="M10.8 5c0-.9.5-1.6 1.2-1.6s1.2.7 1.2 1.6l-.3 4.2c0 .5-.4.9-.9.9s-.9-.4-.9-.9z" fill="currentColor" />
    </svg>
  );
}

function LaporSolidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M8 7 A 7.5 7.5 0 1 0 16 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M9.5 9.8 A 4.3 4.3 0 1 0 14.5 9.8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="13.5" r="1.6" fill="currentColor" />
      <path d="M10.8 5c0-.9.5-1.6 1.2-1.6s1.2.7 1.2 1.6l-.3 4.2c0 .5-.4.9-.9.9s-.9-.4-.9-.9z" fill="currentColor" />
    </svg>
  );
}

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

  // 1. Warga Bottom Nav Items (Tepat 5 Menu)
  const wargaNavItems = [
    {
      label: "Beranda",
      href: "/warga/dashboard",
      icon: HomeOutlineIcon,
      activeIcon: HomeSolidIcon,
    },
    {
      label: "Rute",
      href: "/warga/evakuasi",
      icon: RuteOutlineIcon,
      activeIcon: RuteSolidIcon,
    },
    {
      label: "Lapor",
      href: "/warga/lapor",
      icon: LaporOutlineIcon,
      activeIcon: LaporSolidIcon,
    },
    {
      label: "Posko",
      href: "/warga/posko",
      icon: PoskoShelterOutlineIcon,
      activeIcon: PoskoShelterSolidIcon,
    },
    {
      label: "Komunitas",
      href: "/warga/komunitas",
      icon: UsersOutlineIcon,
      activeIcon: UsersSolidIcon,
    },
  ];

  // 2. Petugas Bottom Nav Items (Tepat 5 Menu: Hapus Komunitas sesuai instruksi)
  const petugasNavItems = [
    {
      label: "Dasbor",
      href: "/petugas/dashboard",
      icon: DashboardOutlineIcon,
      activeIcon: DashboardSolidIcon,
    },
    {
      label: "Peta SAR",
      href: "/petugas/peta-sar",
      icon: MapOutlineIcon,
      activeIcon: MapSolidIcon,
    },
    {
      label: "Triage",
      href: "/petugas/triage",
      icon: TriageOutlineIcon,
      activeIcon: TriageSolidIcon,
    },
    {
      label: "Posko",
      href: "/petugas/posko",
      icon: PoskoShelterOutlineIcon,
      activeIcon: PoskoShelterSolidIcon,
    },
    {
      label: "Telemetri",
      href: "/petugas/telemetri",
      icon: TelemetriOutlineIcon,
      activeIcon: TelemetriSolidIcon,
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
    if (href === "/petugas/peta-sar") {
      return (
        pathname === "/petugas/peta-sar" ||
        pathname?.startsWith("/petugas/peta-sar/") ||
        pathname === "/petugas/peta" ||
        pathname?.startsWith("/petugas/peta/")
      );
    }
    return pathname === href || pathname?.startsWith(href + "/");
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
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-md mx-auto w-full">
        {items.map((item) => {
          const isActive = isItemActive(item.href);
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              replace
              scroll={false}
              className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 cursor-pointer w-full text-center ${
                isActive
                  ? "text-[#38746D]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive
                    ? "text-[#38746D] scale-105"
                    : "text-slate-500"
                }`}
              />
              <span
                className={`text-[11px] tracking-tight leading-tight mt-1 text-center truncate max-w-[68px] ${
                  isActive
                    ? "font-semibold text-[#38746D]"
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
