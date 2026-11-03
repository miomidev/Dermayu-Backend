"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ExternalLink,
  ChevronDown,
  User,
  BookOpen,
  LogOut,
  Search,
  MapPin,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { LogoDermayu } from "@/components/ui/LogoDermayu";
import { AuthBackgroundDecor } from "@/components/auth/AuthBackgroundDecor";
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
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AppHeader({
  role,
  session: propSession,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(propSession || null);

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileCleanDropdownRef = useRef<HTMLDivElement>(null);

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
      const target = e.target as Node;
      const insideDesktop = desktopDropdownRef.current && desktopDropdownRef.current.contains(target);
      const insideMobile = mobileDropdownRef.current && mobileDropdownRef.current.contains(target);
      const insideMobileClean = mobileCleanDropdownRef.current && mobileCleanDropdownRef.current.contains(target);

      if (!insideDesktop && !insideMobile && !insideMobileClean) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearUserSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
  };

  const currentTitle =
    titleMap[pathname] || (role === "petugas" ? "Pusat Kendali BPBD" : "Dasbor Kesiapsiagaan");
  const displayName = session?.name || (role === "petugas" ? "Petugas BPBD" : "Warga Indramayu");
  const displayRole = role === "petugas" ? "Pusdalops BPBD" : "Warga Siaga";
  const initial = displayName.trim().charAt(0).toUpperCase() || (role === "petugas" ? "P" : "W");
  const profileHref = `/${role}/profile`;

  const isWargaDashboard =
    role === "warga" &&
    (pathname === "/warga/dashboard" ||
      pathname === "/dashboard" ||
      pathname === "/warga" ||
      pathname === "/");

  // Komponen Dropdown Menu 4 Item yang Reusable
  const renderUserDropdownMenu = () => (
    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#D5E4E0] shadow-2xl p-1.5 z-50 text-left text-slate-800">
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
          onClick={() => {
            setDropdownOpen(false);
            handleLogout();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer text-left"
        >
          <span>Keluar</span>
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP / LAYAR LEBAR HEADER (>= md)                      */}
      {/* Tetap Normal: Background Putih, Judul Halaman, Menu Dropdown */}
      {/* ============================================================ */}
      <header className="hidden md:flex sticky top-0 h-16 bg-white border-b border-[#D5E4E0] px-6 lg:px-8 items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-base lg:text-lg font-bold text-[#132422] truncate">
            {currentTitle}
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B635F] hover:text-[#132422] transition-colors"
          >
            <span>Lihat Web Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="h-5 w-[1px] bg-gray-200" />

          {/* Profil User Dropdown Desktop */}
          <div className="relative" ref={desktopDropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F8FAF9] transition-colors cursor-pointer"
              aria-expanded={dropdownOpen}
            >
              <div className="w-8 h-8 rounded-full bg-[#EEF5F3] border border-[#38746D]/20 flex items-center justify-center text-xs font-bold text-[#38746D] shrink-0">
                {initial}
              </div>
              <div className="text-left max-w-[170px]">
                <span className="block text-xs font-bold text-[#132422] leading-tight truncate">
                  {displayName}
                </span>
                <span className="block text-[10px] text-[#4B635F] truncate">
                  {displayRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {dropdownOpen && renderUserDropdownMenu()}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MOBILE HEADER DENGAN ANIMASI FRAMER MOTION (< md)        */}
      {/* ============================================================ */}
      <div className="md:hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isWargaDashboard ? (
            /* ========================================================== */
            /* A. KHUSUS DASBOR WARGA: KONTINER HIJAU MELENGKUNG (HERO)   */
            /* ========================================================== */
            <motion.div
              key="mobile-dashboard-hero-container"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-[285px] bg-gradient-to-br from-[#38746D] via-[#2E6A63] to-[#1D443F] text-white px-5 pt-4 pb-4 rounded-b-[36px] shadow-lg relative z-20 overflow-hidden flex flex-col justify-between"
            >
              {/* Ornamen Geometri Abstrak Identik 100% dengan Halaman Auth/Login */}
              <AuthBackgroundDecor />

              {/* Konten Hero Dashboard Baru (Enter Phase 1): Masuk bersamaan dari arah bawah ke atas */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                className="relative z-10 w-full h-full flex flex-col justify-between"
              >
                {/* Bagian Atas: Header Logo & Search/Avatar + Baris Lokasi */}
                <div className="shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <LogoDermayu
                        variant="light"
                        width={36}
                        height={36}
                        className="w-9 h-9 object-contain shrink-0"
                        priority
                      />
                      <span className="text-xl font-black tracking-wider text-white">
                        DERMAYU
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Tombol Search Putih Solid Sesuai Tema Aplikasi */}
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full bg-white text-[#1D443F] shadow-sm flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
                        aria-label="Pencarian Cepat"
                      >
                        <Search className="w-4 h-4 text-[#1D443F] stroke-[2.5]" />
                      </button>

                      {/* Avatar Profil Inisial + Dropdown Menu */}
                      <div className="relative" ref={mobileDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="flex items-center justify-center p-0.5 rounded-full cursor-pointer transition active:scale-95"
                          aria-expanded={dropdownOpen}
                          aria-label="Menu Pengguna"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#EEF5F3] border border-[#38746D]/30 flex items-center justify-center text-sm font-bold text-[#38746D] shrink-0 shadow-xs">
                            {initial}
                          </div>
                        </button>

                        {dropdownOpen && renderUserDropdownMenu()}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Lokasi Warga dengan Jarak Seimbang ke Atas & Bawah */}
                  <div className="flex items-center gap-1.5 text-xs text-white/90 mt-3.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span className="text-white/70 text-[11px]">Lokasi Anda:</span>
                    <div className="flex items-center gap-1 font-bold text-white text-xs cursor-pointer hover:text-emerald-200">
                      <span>Kandanghaur, Indramayu</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                    </div>
                  </div>
                </div>

                {/* Bagian Hero Content: Berjarak Simetris dari Baris Lokasi dan Posisi Lebih Pas Mendekati Batas Bawah */}
                <div className="flex-1 flex items-center justify-between gap-2.5 mt-auto pt-3 pb-1">
                  <div className="flex-1 min-w-0 pr-1">
                    <h2 className="text-[17px] sm:text-lg font-black tracking-tight text-white leading-tight uppercase">
                      TANGGAP BENCANA, SATU SENTUHAN!
                    </h2>
                    <p className="text-[11px] sm:text-xs text-[#D1E5E2] mt-1.5 leading-snug line-clamp-2">
                      Layanan cepat, aman &amp; terpercaya untuk keselamatan warga Indramayu.
                    </p>
                    <Link
                      href="/warga/evakuasi"
                      className="inline-flex items-center gap-1.5 mt-3.5 px-4.5 py-2.5 rounded-full bg-white text-[#1D443F] text-xs font-black shadow-md hover:bg-emerald-50 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Cek Rute Evakuasi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Gambar Hero Murni Tanpa Glassmorphism / Background Box */}
                  <div className="w-32 h-32 sm:w-36 sm:h-36 relative shrink-0 flex items-center justify-center">
                    <img
                      src="/hero-dashboard-dermayu.png"
                      alt="Tanggap Bencana DERMAYU"
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* ========================================================== */
            /* B. HALAMAN FITUR LAIN: APP BAR PUTIH LOGO & PROFIL        */
            /* ========================================================== */
            <motion.div
              key="mobile-feature-header-clean"
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white border-b border-slate-100 text-slate-800 h-16 px-4 flex items-center justify-between sticky top-0 z-20 shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Link
                  href="/"
                  className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                  title="Beranda DERMAYU"
                >
                  <LogoDermayu
                    variant="dark"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain shrink-0"
                  />
                  <span className="text-lg font-extrabold tracking-tight text-[#1D443F]">
                    DERMAYU
                  </span>
                </Link>
              </div>

              {/* Avatar Inisial di Mobile Header Halaman Fitur Lain */}
              <div className="relative" ref={mobileCleanDropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center p-0.5 rounded-full cursor-pointer transition active:scale-95"
                  aria-expanded={dropdownOpen}
                  aria-label="Menu Pengguna"
                >
                  <div className="w-9 h-9 rounded-full bg-[#EEF5F3] border border-[#38746D]/20 flex items-center justify-center text-sm font-bold text-[#38746D] shrink-0 shadow-xs">
                    {initial}
                  </div>
                </button>

                {dropdownOpen && renderUserDropdownMenu()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
