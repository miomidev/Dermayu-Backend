"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  ChevronDown,
  Menu,
  User,
  BookOpen,
  LogOut,
} from "lucide-react";
import { getActiveSession, clearUserSession, type UserSession } from "@/utils/authSession";

// Pemetaan judul dinamis berdasarkan pathname aktif
const titleMap: Record<string, string> = {
  "/warga/dashboard": "Dasbor Kesiapsiagaan",
  "/warga/evakuasi": "Navigasi Rute Evakuasi",
  "/warga/lapor": "Lapor Titik Banjir",
  "/warga/posko": "Pantauan Posko",
  "/warga/aduan": "Riwayat Aduan Saya",
  "/warga/kontak": "Kontak Darurat 24 Jam",
  "/warga/komunitas": "Komunitas Warga Siaga",
  "/warga/profile": "Profil Pengguna",
  "/petugas/dashboard": "Pusat Kendali BPBD",
  "/petugas/triage": "Triage & Verifikasi Aduan",
  "/petugas/posko": "Manajemen Posko Lapangan",
  "/petugas/telemetri": "Telemetri TMA & Rob",
  "/petugas/settings": "Pengaturan Sistem",
  "/petugas/profile": "Profil Petugas BPBD",
};

export interface AppHeaderProps {
  role: "warga" | "petugas";
  onOpenMobileMenu?: () => void;
  session?: UserSession | null;
}

export function AppHeader({ role, onOpenMobileMenu, session: propSession }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(propSession || null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync session from storage / event
  useEffect(() => {
    const updateSession = () => {
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

    updateSession();

    window.addEventListener("dermayu_session_updated", updateSession);
    window.addEventListener("storage", updateSession);

    return () => {
      window.removeEventListener("dermayu_session_updated", updateSession);
      window.removeEventListener("storage", updateSession);
    };
  }, [role]);

  // If parent propSession changes, update local state
  useEffect(() => {
    if (propSession) {
      setSession(propSession);
    }
  }, [propSession]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearUserSession();
    router.push("/login");
  };

  const currentTitle = titleMap[pathname] || (role === "petugas" ? "Pusat Kendali BPBD" : "Dasbor Kesiapsiagaan");
  const displayName = session?.name || (role === "petugas" ? "Petugas BPBD" : "Warga Indramayu");
  const displayRole = role === "petugas" ? "Pusdalops BPBD" : "Warga Siaga";
  const initial = displayName.trim().charAt(0).toUpperCase() || (role === "petugas" ? "P" : "W");
  const profileHref = `/${role}/profile`;

  return (
    <header className="sticky top-0 h-16 bg-white border-b border-[#D5E4E0] px-4 sm:px-8 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger Mobile Trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 md:hidden cursor-pointer shrink-0"
          aria-label="Buka navigasi sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#132422] truncate">
          {currentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B635F] hover:text-[#132422] transition-colors"
        >
          <span className="hidden sm:inline">Lihat Web Publik</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="h-5 w-[1px] bg-gray-200" />

        {/* Profil User Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F8FAF9] transition-colors cursor-pointer"
            aria-expanded={dropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-[#EEF5F3] border border-[#38746D]/20 flex items-center justify-center text-xs font-bold text-[#38746D] shrink-0">
              {initial}
            </div>
            <div className="hidden sm:block text-left max-w-[170px]">
              <span className="block text-xs font-bold text-[#132422] leading-tight truncate">
                {displayName}
              </span>
              <span className="block text-[10px] text-[#4B635F] truncate">
                {displayRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu Minimalis */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#D5E4E0] shadow-xl p-1.5 z-50 text-left">
              <div className="space-y-0.5 text-xs">
                {/* 1. Profil Saya */}
                <Link
                  href={profileHref}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#132422] font-semibold hover:bg-[#EEF5F3] hover:text-[#1D443F] transition-colors"
                >
                  <span>Profil Saya</span>
                  <User className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                {/* 2. Portal Publik */}
                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#4B635F] hover:bg-[#EEF5F3] hover:text-[#132422] transition-colors font-medium"
                >
                  <span>Portal Publik</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                {/* 3. Buku Panduan Siaga */}
                <Link
                  href="/panduan"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#4B635F] hover:bg-[#EEF5F3] hover:text-[#132422] transition-colors font-medium"
                >
                  <span>Buku Panduan Siaga</span>
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                {/* Divider */}
                <div className="my-1 border-t border-gray-100" />

                {/* 4. Keluar */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer text-left"
                >
                  <span>Keluar</span>
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

