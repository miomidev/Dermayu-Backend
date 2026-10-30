"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  Clock,
  BookOpen,
  PhoneCall,
  X,
} from "lucide-react";

export interface AppSidebarProps {
  role: "warga" | "petugas";
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AppSidebar({ role, mobileOpen, onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();

  const navItems =
    role === "petugas"
      ? [
          { label: "Ringkasan Dasbor", href: "/petugas/dashboard", icon: LayoutDashboard },
          { label: "Triage & Verifikasi Aduan", href: "/petugas/triage", icon: ClipboardList, badge: "3" },
          { label: "Peta Spasial & SAR", href: "/admin/dashboard", icon: Map },
          { label: "Manajemen Posko", href: "/petugas/posko", icon: Home },
          { label: "Telemetri TMA & Rob", href: "/petugas/telemetri", icon: Activity },
          { label: "Pengaturan Sistem", href: "/petugas/settings", icon: Settings },
        ]
      : [
          { label: "Dasbor Kesiapsiagaan", href: "/warga/dashboard", icon: ShieldCheck },
          { label: "Navigasi Evakuasi Aman", href: "/warga/evakuasi", icon: Navigation },
          { label: "Lapor Titik Banjir", href: "/warga/lapor", icon: AlertCircle },
          { label: "Pantauan Posko", href: "/warga/posko", icon: Home },
          { label: "Riwayat Aduan Saya", href: "/warga/aduan", icon: Clock, badge: "2" },
          { label: "Kontak Darurat 24 Jam", href: "/warga/kontak", icon: PhoneCall },
          { label: "Panduan Mitigasi", href: "/panduan", icon: BookOpen },
        ];

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
      <aside
        className={`w-64 bg-[#1D443F] text-white fixed top-0 bottom-0 left-0 flex flex-col justify-between z-50 shadow-md transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header (Tanpa garis pemisah border-b) */}
          <div className="h-20 px-6 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-[#38746D] flex items-center justify-center p-1.5 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Image
                  src="/dermayu-logo.webp"
                  alt="Logo DERMAYU"
                  width={24}
                  height={24}
                  className="object-contain"
                  priority
                />
              </div>
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

          {/* Navigasi Menu Utama */}
          <div className="px-3.5 py-2 flex-1">
            <p className="text-[10px] font-semibold text-[#6B9C95] tracking-wider uppercase px-3 mb-2.5">
              Menu Utama
            </p>
            <nav className="space-y-1.5 px-1">
              {navItems.map((item) => {
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
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

