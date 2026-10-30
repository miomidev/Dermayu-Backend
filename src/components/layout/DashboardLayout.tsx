"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  Home,
  Activity,
  Settings,
  LogOut,
  ShieldCheck,
  Navigation,
  AlertCircle,
  Clock,
  BookOpen,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  PhoneCall,
} from "lucide-react";
import {
  touchDashboardActivity,
  clearUserSession,
} from "@/utils/authSession";

export interface DashboardLayoutProps {
  role?: "petugas" | "warga";
  title?: string;
  pageTitle?: string;
  userName?: string;
  userRoleLabel?: string;
  userLocation?: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  role = "warga",
  title,
  pageTitle,
  userName = role === "petugas" ? "Komandan Surya BPBD" : "Pak Kusnan",
  userRoleLabel = role === "petugas" ? "Operator Pusdalops BPBD" : "Warga Siaga",
  userLocation = role === "petugas" ? "Pusdalops Indramayu" : "Kandanghaur - Eretan Wetan",
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile sidebar on route change & touch session activity
  useEffect(() => {
    setMobileMenuOpen(false);
    touchDashboardActivity();
  }, [pathname]);

  // Session Heartbeat: Saat user berada di dalam dashboard, session tidak boleh expired
  useEffect(() => {
    touchDashboardActivity();
    // Update timestamp setiap 1 menit saat aktif di dashboard
    const heartbeatInterval = setInterval(() => {
      touchDashboardActivity();
    }, 60 * 1000);

    // Event listener interaksi pengguna (throttled)
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

  const handleLogout = () => {
    clearUserSession();
    router.push("/login");
  };

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

  // Judul halaman ringkas dan bersih (bebas slop)
  const headerTitle =
    title ||
    pageTitle ||
    (role === "petugas" ? "Pusat Kendali BPBD" : "Dasbor Kesiapsiagaan");

  const avatarInitial = userName.trim().charAt(0).toUpperCase() || "D";

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col md:flex-row antialiased select-none">
      {/* ============================================================ */}
      {/* 1. SIDEBAR HIJAU DEEP TEAL (DESKTOP + OFF-CANVAS MOBILE)     */}
      {/* ============================================================ */}
      {/* Backdrop Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 bg-[#1D443F] text-white fixed top-0 bottom-0 left-0 flex flex-col justify-between z-50 shadow-md transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header (Tanpa border-b) */}
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
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-xl text-[#88BDB6] hover:text-white hover:bg-white/10 md:hidden cursor-pointer"
              aria-label="Tutup sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Navigasi Utama */}
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
                    onClick={() => setMobileMenuOpen(false)}
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

      {/* ============================================================ */}
      {/* 2. AREA KONTEN UTAMA DENGAN TOP HEADER                       */}
      {/* ============================================================ */}
      <div className="md:ml-64 flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar: Satu Baris Bersih & Elegan */}
        <header className="sticky top-0 h-16 bg-white border-b border-[#D5E4E0] px-4 sm:px-8 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger Button untuk Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 md:hidden cursor-pointer shrink-0"
              aria-label="Buka navigasi sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-base sm:text-lg font-bold text-[#132422]">
              {headerTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B635F] hover:text-[#132422] transition-colors"
              title="Kunjungi Beranda Publik DERMAYU"
            >
              <span className="hidden sm:inline">Lihat Web Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="h-5 w-[1px] bg-gray-200" />

            {/* Profile Dropdown Container */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                aria-expanded={profileDropdownOpen}
              >
                {/* Avatar Bulat */}
                <div className="w-8 h-8 rounded-full bg-[#EEF5F3] border border-[#38746D]/20 flex items-center justify-center text-xs font-bold text-[#38746D] shrink-0">
                  {avatarInitial}
                </div>

                {/* Nama & Role Subteks (Desktop) */}
                <div className="text-left hidden sm:block max-w-[170px]">
                  <span className="block text-xs font-bold text-[#132422] truncate leading-tight">
                    {userName}
                  </span>
                  <span className="block text-[10px] text-[#4B635F] truncate">
                    {userRoleLabel}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu Profil */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#D5E4E0] shadow-xl p-2 z-50 text-left">
                  <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E8F1EE] mb-1.5">
                    <p className="text-xs font-bold text-[#132422] truncate">{userName}</p>
                    <p className="text-[10px] text-[#718783] mt-0.5">{userRoleLabel}</p>
                    {userLocation && (
                      <p className="text-[10px] text-[#38746D] font-medium mt-1 truncate">
                        📍 {userLocation}
                      </p>
                    )}
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <Link
                      href="/"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-[#4B635F] hover:bg-[#EEF5F3] hover:text-[#132422] transition-colors"
                    >
                      <span>Portal Publik</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/panduan"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-[#4B635F] hover:bg-[#EEF5F3] hover:text-[#132422] transition-colors"
                    >
                      <span>Buku Panduan Siaga</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </Link>

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
