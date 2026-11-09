"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogoDermayu } from "@/components/ui/LogoDermayu";
import { ForkedRouteIcon, BeaconAlertIcon, PoskoShelterIcon } from "@/components/ui/Icons";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  Home,
  Activity,
  Settings,
  ShieldCheck,
  Navigation,
  AlertCircle,
  BookOpen,
  Users,
  User,
  PhoneCall,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export interface AppSidebarProps {
  role: "warga" | "petugas";
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function AppSidebar({
  role,
  mobileOpen,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateSize = () => setIsMobile(window.innerWidth < 768);
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 1. Menu Utama
  const mainNavItems: NavItem[] =
    role === "petugas"
      ? [
          { label: "Ringkasan Dasbor", href: "/petugas/dashboard", icon: LayoutDashboard },
          { label: "Peta Spasial & SAR", href: "/petugas/peta-sar", icon: Map },
          { label: "Triage & Verifikasi Aduan", href: "/petugas/triage", icon: ClipboardList, badge: "3" },
          { label: "Manajemen Posko", href: "/petugas/posko", icon: PoskoShelterIcon },
          { label: "Telemetri TMA & Rob", href: "/petugas/telemetri", icon: Activity },
          { label: "Komunitas", href: "/petugas/komunitas", icon: Users },
        ]
      : [
          { label: "Dasbor Kesiapsiagaan", href: "/warga/dashboard", icon: Home },
          { label: "Peta & Rute Evakuasi", href: "/warga/evakuasi", icon: ForkedRouteIcon },
          { label: "Lapor Titik Banjir", href: "/warga/lapor", icon: BeaconAlertIcon },
          { label: "Pantauan Posko", href: "/warga/posko", icon: PoskoShelterIcon },
          { label: "Komunitas Warga", href: "/warga/komunitas", icon: Users },
        ];

  // 2. Menu Lainnya
  const secondaryNavItems: NavItem[] =
    role === "petugas"
      ? [
          { label: "Buku Panduan Siaga", href: "/petugas/panduan", icon: BookOpen },
          { label: "Profil Petugas", href: "/petugas/profile", icon: User },
          { label: "Pengaturan Sistem", href: "/petugas/settings", icon: Settings },
        ]
      : [
          { label: "Kontak Darurat 112", href: "/warga/kontak", icon: PhoneCall },
          { label: "Buku Panduan Siaga", href: "/warga/panduan", icon: BookOpen },
          { label: "Profil Saya", href: "/warga/profile", icon: User },
        ];

  const renderNavLink = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <div key={item.label} className="relative w-full">
        <Link
          href={item.href}
          onClick={onCloseMobile}
          title={collapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ""}` : undefined}
          className={`flex items-center ${
            collapsed
              ? "justify-center w-12 h-12 mx-auto"
              : "justify-between px-4 py-3"
          } rounded-2xl text-xs transition-all duration-200 cursor-pointer ${
            isActive
              ? "bg-white text-[#1D443F] font-bold shadow-md"
              : "text-[#D1E5E2] hover:bg-white/10 hover:text-white font-medium"
          }`}
        >
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} min-w-0`}>
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isActive ? "text-[#1D443F]" : "text-[#D1E5E2]"
              }`}
            />
            {!collapsed && (
              <span className="truncate tracking-wide">{item.label}</span>
            )}
          </div>

          {!collapsed && item.badge && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                isActive
                  ? "bg-[#EEF5F3] text-[#1D443F]"
                  : "bg-amber-400 text-amber-950"
              }`}
            >
              {item.badge}
            </span>
          )}

          {/* Badge dot saat mode icon-only */}
          {collapsed && item.badge && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#1D443F]" />
          )}
        </Link>
      </div>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ x: 0, width: collapsed ? "5rem" : "16rem" }}
      transition={{
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1] as const,
      }}
      data-lenis-prevent="true"
      className={`hidden md:flex bg-[#1D443F] text-white fixed top-0 bottom-0 left-0 flex-col justify-between z-40 shadow-md select-none overscroll-none touch-pan-y ${
        collapsed ? "w-20" : "w-64"
      }`}
    >


        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10">
          {/* Logo Header */}
          <div
            className={`h-20 ${
              collapsed ? "px-2 justify-center" : "px-6 justify-between"
            } flex items-center shrink-0 transition-all`}
          >
            <Link
              href="/"
              className={`flex items-center ${
                collapsed ? "justify-center" : "gap-2.5"
              } group`}
              title={collapsed ? "DERMAYU" : undefined}
            >
              <LogoDermayu
                variant="light"
                width={36}
                height={36}
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform shrink-0"
                priority
              />
              {!collapsed && (
                <div className="text-left overflow-hidden">
                  <span className="font-extrabold text-base tracking-tight text-white block leading-tight truncate">
                    DERMAYU
                  </span>
                  <span className="text-[10px] font-semibold text-[#88BDB6] tracking-wider uppercase truncate block">
                    {role === "petugas" ? "PUSDALOPS BPBD" : "PORTAL WARGA"}
                  </span>
                </div>
              )}
            </Link>

            {/* Tombol Tutup Khusus Mobile */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-[#88BDB6] hover:text-white hover:bg-white/10 md:hidden cursor-pointer"
              aria-label="Tutup navigasi sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigasi Menu Dikelompokkan */}
          <div className={`${collapsed ? "px-2" : "px-4"} py-2 flex-1 overflow-x-hidden`}>
            {/* Kelompok Menu Utama */}
            {!collapsed && (
              <p className="text-[10px] font-semibold text-[#6B9C95] tracking-wider uppercase px-3 mb-2">
                Menu Utama
              </p>
            )}
            <nav className="space-y-1 px-1 overflow-x-hidden">
              {mainNavItems.map(renderNavLink)}
            </nav>

            {/* Kelompok Lainnya */}
            {!collapsed ? (
              <p className="text-[10px] font-semibold text-[#6B9C95] tracking-wider uppercase px-3 mb-2 mt-5">
                Lainnya
              </p>
            ) : (
              <div className="w-8 h-[1px] bg-white/10 mx-auto my-3" />
            )}
            <nav className="space-y-1 px-1 overflow-x-hidden">
              {secondaryNavItems.map(renderNavLink)}
            </nav>
          </div>
        </div>

        {/* Tombol Collapse di bagian bawah sidebar (Desktop) */}
        {onToggleCollapse && (
          <div className="p-3 border-t border-white/10 hidden md:block shrink-0 overflow-hidden">
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`w-full flex items-center ${
                collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
              } rounded-xl text-xs text-[#88BDB6] hover:text-white hover:bg-white/10 transition-colors cursor-pointer group`}
              title={collapsed ? "Perluas Sidebar (Ctrl+B)" : "Ciutkan Sidebar (Ctrl+B)"}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-[#88BDB6] group-hover:text-white transition-colors" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 shrink-0 text-[#88BDB6] group-hover:text-white transition-colors" />
                  <span className="truncate font-medium">Ciutkan Menu</span>
                  <kbd className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-[#D1E5E2] font-mono border border-white/10">
                    Ctrl+B
                  </kbd>
                </>
              )}
            </button>
          </div>
        )}
      </motion.aside>
  );
}
