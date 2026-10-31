"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogoDermayu } from "@/components/ui/LogoDermayu";
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
  X,
} from "lucide-react";

export interface AppSidebarProps {
  role: "warga" | "petugas";
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function AppSidebar({ role, mobileOpen, onCloseMobile }: AppSidebarProps) {
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
          { label: "Triage & Verifikasi Aduan", href: "/petugas/triage", icon: ClipboardList, badge: "3" },
          { label: "Peta Spasial & SAR", href: "/admin/dashboard", icon: Map },
          { label: "Manajemen Posko", href: "/petugas/posko", icon: Home },
          { label: "Telemetri TMA & Rob", href: "/petugas/telemetri", icon: Activity },
        ]
      : [
          { label: "Dasbor Kesiapsiagaan", href: "/warga/dashboard", icon: ShieldCheck },
          { label: "Navigasi Evakuasi Aman", href: "/warga/evakuasi", icon: Navigation },
          { label: "Lapor Titik Banjir", href: "/warga/lapor", icon: AlertCircle },
          { label: "Pantauan Posko", href: "/warga/posko", icon: Home },
          { label: "Komunitas Warga", href: "/warga/komunitas", icon: Users },
        ];

  // 2. Menu Lainnya
  const secondaryNavItems: NavItem[] =
    role === "petugas"
      ? [
          { label: "Profil Petugas", href: "/petugas/profile", icon: User },
          { label: "Pengaturan Sistem", href: "/petugas/settings", icon: Settings },
        ]
      : [
          { label: "Profil Saya", href: "/warga/profile", icon: User },
          { label: "Panduan Mitigasi", href: "/panduan", icon: BookOpen },
        ];

  const renderNavLink = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={onCloseMobile}
        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs transition-all duration-200 cursor-pointer ${
          isActive
            ? "bg-white text-[#1D443F] font-bold shadow-md"
            : "text-[#D1E5E2] hover:bg-white/10 hover:text-white font-medium"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 ${
              isActive ? "text-[#1D443F]" : "text-[#D1E5E2]"
            }`}
          />
          <span className="truncate tracking-wide">{item.label}</span>
        </div>
        {item.badge && (
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
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <motion.aside
        initial={!isMobile ? { x: "-100%" } : false}
        animate={
          isMobile
            ? { x: mobileOpen ? 0 : "-100%" }
            : { x: 0 }
        }
        transition={{
          duration: isMobile ? 0.3 : 0.5,
          ease: [0.16, 1, 0.3, 1] as const,
        }}
        className={`w-64 bg-[#1D443F] text-white fixed top-0 bottom-0 left-0 flex flex-col justify-between z-50 shadow-md ${
          !mounted ? (mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0") : ""
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header (Tanpa garis pemisah border-b) */}
          <div className="h-20 px-6 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <LogoDermayu
                variant="light"
                width={36}
                height={36}
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform shrink-0"
                priority
              />
              <div className="text-left">
                <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                  DERMAYU
                </span>
                <span className="text-[10px] font-semibold text-[#88BDB6] tracking-wider uppercase">
                  {role === "petugas" ? "PUSDALOPS BPBD" : "PORTAL WARGA"}
                </span>
              </div>
            </Link>

            {/* Tombol Tutup Mobile */}
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
          <div className="px-4 py-2 flex-1 overflow-y-auto">
            {/* Kelompok Menu Utama */}
            <p className="text-[10px] font-semibold text-[#6B9C95] tracking-wider uppercase px-3 mb-2">
              Menu Utama
            </p>
            <nav className="space-y-1 px-1">
              {mainNavItems.map(renderNavLink)}
            </nav>

            {/* Kelompok Lainnya */}
            <p className="text-[10px] font-semibold text-[#6B9C95] tracking-wider uppercase px-3 mb-2 mt-5">
              Lainnya
            </p>
            <nav className="space-y-1 px-1">
              {secondaryNavItems.map(renderNavLink)}
            </nav>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
