"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
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
  ClipboardList,
} from "lucide-react";
import { ForkedRouteIcon, BeaconAlertIcon } from "@/components/ui/Icons";
import { LogoDermayu } from "@/components/ui/LogoDermayu";
import { AuthBackgroundDecor } from "@/components/auth/AuthBackgroundDecor";
import {
  Bell,
  X,
  ChevronRight,
} from "lucide-react";
import { MobileSearchOverlay, searchableData, type SearchItem } from "@/components/dashboard/MobileSearchOverlay";
import { Hero3DImage } from "@/components/dashboard/Hero3DImage";
import { getActiveSession, clearUserSession, performLogout, type UserSession } from "@/utils/authSession";

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
  "/warga/panduan": "Buku Panduan Siaga",
  "/petugas/dashboard": "Pusat Kendali BPBD",
  "/petugas/triage": "Triage & Verifikasi Aduan",
  "/petugas/posko": "Manajemen Posko Lapangan",
  "/petugas/telemetri": "Telemetri TMA & Rob",
  "/petugas/settings": "Pengaturan Sistem",
  "/petugas/profile": "Profil Petugas BPBD",
  "/petugas/peta-sar": "Peta Spasial & SAR",
  "/petugas/panduan": "Buku Panduan Siaga",
  "/dashboard/panduan": "Buku Panduan Siaga",
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notifikasi & Desktop Search State
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false);
  const [desktopQuery, setDesktopQuery] = useState("");
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const desktopNotifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);
  const mobileCleanNotifRef = useRef<HTMLDivElement>(null);

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileCleanDropdownRef = useRef<HTMLDivElement>(null);

  // Data Notifikasi Siaga
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Peringatan Dini Rob Eretan Wetan",
      message: "Ketinggian genangan air pasang mencapai 45 cm. Akses jalan pelelangan ikan dialihkan.",
      time: "10m lalu",
      type: "warning",
      unread: true,
      href: "/warga/evakuasi",
    },
    {
      id: "notif-2",
      title: "Posko Baru Dibuka",
      message: "GOR Mini Kandanghaur kini siap menerima warga pengungsi dengan kapasitas 500 jiwa.",
      time: "35m lalu",
      type: "info",
      unread: true,
      href: "/warga/posko",
    },
    {
      id: "notif-3",
      title: "Laporan Banjir Diverifikasi",
      message: "Tiket #DMY-0038 telah divalidasi oleh petugas BPBD Indramayu. Status: Ditindaklanjuti.",
      time: "1j lalu",
      type: "success",
      unread: false,
      href: "/warga/aduan",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Auto-close search on route change
  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  // Melacak sumber navigasi (Internal Nav antar fitur vs Masuk dari Auth)
  const prevPathnameRef = useRef<string | null>(null);
  const [isInternalNav, setIsInternalNav] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fromAuth = sessionStorage.getItem("dermayu_from_auth") === "true";
      if (fromAuth) {
        setIsInternalNav(false);
        sessionStorage.removeItem("dermayu_from_auth");
      }
    }
  }, []);

  useEffect(() => {
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      setIsInternalNav(true);
    }
    prevPathnameRef.current = pathname;
  }, [pathname]);

  // Deteksi scroll untuk mengubah App Bar dari transparan ke frosted teal saat scroll melewati hero
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsScrolled(false);
  }, [pathname]);


  // Sync session from storage / event
  useEffect(() => {
    const updateSession = () => {
      const active = getActiveSession();
      if (active) {
        setSession(active);
      } else if (propSession) {
        setSession(propSession);
      } else {
        setSession(null);
      }
    };

    updateSession();

    window.addEventListener("dermayu_session_updated", updateSession);
    window.addEventListener("dermayu_session_cleared", updateSession);
    window.addEventListener("storage", updateSession);

    return () => {
      window.removeEventListener("dermayu_session_updated", updateSession);
      window.removeEventListener("dermayu_session_cleared", updateSession);
      window.removeEventListener("storage", updateSession);
    };
  }, [role, propSession]);

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

      const insideDesktopNotif = desktopNotifRef.current && desktopNotifRef.current.contains(target);
      const insideMobileNotif = mobileNotifRef.current && mobileNotifRef.current.contains(target);
      const insideMobileCleanNotif = mobileCleanNotifRef.current && mobileCleanNotifRef.current.contains(target);
      if (!insideDesktopNotif && !insideMobileNotif && !insideMobileCleanNotif) {
        setNotifOpen(false);
        setMobileNotifOpen(false);
      }

      const insideDesktopSearch = desktopSearchRef.current && desktopSearchRef.current.contains(target);
      if (!insideDesktopSearch) {
        setDesktopSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K untuk fokus pencarian web
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        desktopSearchInputRef.current?.focus();
        setDesktopSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    setSession(null);
    performLogout("/login");
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

  const isPetugasDashboard =
    role === "petugas" &&
    (pathname === "/petugas/dashboard" ||
      pathname === "/petugas");

  const isDashboard = isWargaDashboard || isPetugasDashboard;

  // Hasil filter pencarian desktop
  const filteredDesktopResults = desktopQuery.trim()
    ? searchableData
        .filter((item) => {
          const q = desktopQuery.trim().toLowerCase();
          return (
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.keywords.some((k) => k.includes(q))
          );
        })
        .slice(0, 6)
    : [];

  const handleDesktopSelect = (href: string) => {
    setDesktopQuery("");
    setDesktopSearchOpen(false);
    router.push(href);
  };

  const handleDesktopSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredDesktopResults.length > 0) {
      e.preventDefault();
      handleDesktopSelect(filteredDesktopResults[0].href);
    }
    if (e.key === "Escape") {
      setDesktopSearchOpen(false);
      desktopSearchInputRef.current?.blur();
    }
  };

  // Komponen Notifikasi Dropdown Reusable
  const renderNotificationDropdown = (positionClasses = "right-0 mt-2") => (
    <div
      className={`absolute ${positionClasses} w-80 sm:w-88 bg-white rounded-2xl border border-[#D5E4E0] shadow-2xl p-3 z-50 text-left text-slate-800`}
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#38746D]" />
          <span className="text-xs font-bold text-slate-900">Notifikasi Siaga</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600">
              {unreadCount} baru
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
            }}
            className="text-[10px] font-semibold text-[#38746D] hover:underline cursor-pointer"
          >
            Tandai dibaca
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-50 mt-1.5 max-h-72 overflow-y-auto space-y-1">
        {notifications.map((notif) => (
          <Link
            key={notif.id}
            href={notif.href || "#"}
            onClick={() => {
              setNotifOpen(false);
              setMobileNotifOpen(false);
            }}
            className={`block p-2 rounded-xl transition-colors ${
              notif.unread
                ? "bg-emerald-50/60 hover:bg-emerald-50"
                : "hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  notif.unread ? "bg-emerald-500 animate-pulse" : "bg-transparent"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[9px] text-slate-400 shrink-0 ml-1">
                    {notif.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  // Komponen Dropdown Menu 4 Item yang Reusable
  const renderUserDropdownMenu = () => (
    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#D5E4E0] shadow-2xl p-1.5 z-50 text-left text-slate-800">
      <div className="space-y-0.5 text-xs">
        {/* 1. Profil Saya */}
        <Link
          href={profileHref}
          replace
          scroll={false}
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
          href={`/${role}/panduan`}
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
      <header className="hidden md:flex sticky top-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#D5E4E0] px-6 lg:px-8 items-center justify-between z-40 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-base lg:text-lg font-bold text-[#132422] truncate">
            {currentTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3.5">
          {/* 1. Desktop Direct Search Bar Responsif Web */}
          <div className="relative" ref={desktopSearchRef}>
            <div className="w-64 lg:w-80 h-10 rounded-full bg-[#F8FAF9] border border-[#D5E4E0] px-3.5 flex items-center gap-2.5 text-xs focus-within:border-[#38746D] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#38746D]/15 transition-all">
              <Search className="w-4 h-4 text-[#4B635F] shrink-0" />
              <input
                ref={desktopSearchInputRef}
                type="text"
                value={desktopQuery}
                onChange={(e) => {
                  setDesktopQuery(e.target.value);
                  setDesktopSearchOpen(true);
                }}
                onFocus={() => {
                  if (desktopQuery.trim()) setDesktopSearchOpen(true);
                }}
                onKeyDown={handleDesktopSearchKeyDown}
                placeholder="Cari rute, posko, aduan..."
                className="bg-transparent flex-1 outline-none text-xs text-[#132422] placeholder:text-gray-400 font-medium"
              />
              {desktopQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setDesktopQuery("");
                    setDesktopSearchOpen(false);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Hapus kata kunci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-flex items-center text-[10px] font-mono text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                  Ctrl K
                </kbd>
              )}
            </div>

            {/* Desktop Search Live Dropdown Results */}
            {desktopSearchOpen && desktopQuery.trim() && (
              <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl border border-[#D5E4E0] shadow-2xl p-2 z-50 max-h-80 overflow-y-auto">
                {filteredDesktopResults.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 block">
                      Hasil Pencarian ({filteredDesktopResults.length})
                    </span>
                    {filteredDesktopResults.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleDesktopSelect(item.href)}
                          className="w-full p-2 rounded-xl hover:bg-[#EEF5F3] flex items-center justify-between text-left transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
                            >
                              <ItemIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-800 group-hover:text-[#1D443F] truncate">
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-600 shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 truncate">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#38746D] shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500">
                    Tidak ada hasil untuk &ldquo;{desktopQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Tombol Notifikasi Bell Responsif Web */}
          <div className="relative" ref={desktopNotifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-10 h-10 rounded-full hover:bg-[#EEF5F3] text-[#1D443F] flex items-center justify-center transition-colors relative cursor-pointer border border-[#D5E4E0]/80 hover:border-[#38746D]/40"
              aria-expanded={notifOpen}
              aria-label="Notifikasi Siaga"
            >
              <Bell className="w-4 h-4 text-[#1D443F]" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {notifOpen && renderNotificationDropdown("right-0 mt-2")}
          </div>

          <div className="h-5 w-[1px] bg-gray-200" />

          {/* 3. Profil User Dropdown Desktop */}
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
      {/* 2. MOBILE HEADER & DYNAMIC HERO BANNER (< md)                */}
      {/* Hero memanjang dari ujung atas layar dan memendek ke atas    */}
      {/* Tanpa kedipan layar dan transisi warna app bar sealami fisis */}
      {/* ============================================================ */}
      <div className="md:hidden relative z-40 w-full">
        {/* 2A. SIBLING 1: PERSISTENT STICKY APP BAR BACKGROUND BASE (z-10) */}
        <div
          style={{
            height: "calc(60px + env(safe-area-inset-top, 0px))",
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
          className={`sticky top-0 z-10 w-full pointer-events-none transition-colors duration-300 ${
            isDashboard && isScrolled
              ? "bg-[#1D443F]/95 backdrop-blur-md border-b border-[#38746D]/30 shadow-md"
              : "bg-white border-b border-slate-100 shadow-2xs"
          }`}
        />

        {/* 2B. SIBLING 2: DYNAMIC GREEN HERO SURFACE (z-20) */}
        {/* Mulai dari ujung paling atas layar (top: 0), memanjang ke bawah menutup app bar */}
        {/* Ketika berpindah halaman, memendek ke atas ke ujung layar (height: 0) tanpa kedipan */}
        <motion.div
          initial={false}
          animate={{
            height: isDashboard ? "calc(285px + env(safe-area-inset-top, 0px))" : 0,
          }}
          transition={{
            duration: 0.38,
            ease: [0.32, 0.72, 0, 1] as const,
          }}
          className={`w-full overflow-hidden absolute top-0 left-0 right-0 z-20 rounded-b-[40px] transition-[box-shadow] duration-300 ${
            isDashboard ? "shadow-lg pointer-events-auto" : "shadow-none pointer-events-none"
          }`}
        >
          <div
            style={{
              minHeight: "calc(285px + env(safe-area-inset-top, 0px))",
              paddingTop: "calc(60px + env(safe-area-inset-top, 0px))",
            }}
            className="w-full bg-gradient-to-b from-[#38746D] via-[#2E6A63] to-[#1D443F] text-white px-5 pb-4 relative overflow-hidden flex flex-col justify-start"
          >
            {/* Ornamen Geometri Abstrak Identik 100% dengan Halaman Auth/Login */}
            <AuthBackgroundDecor />

            {isPetugasDashboard ? (
              /* KONTEN HERO OPERASIONAL PETUGAS (PUSDALOPS) */
              <motion.div
                animate={{ y: isDashboard ? 0 : -60 }}
                transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] as const }}
                className="relative z-10 w-full flex flex-col justify-start mt-2"
              >
                {/* Info Lokasi Pusat Kendali Petugas */}
                <div className="flex items-center gap-1.5 text-xs text-white/90 mb-3.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="text-white/70 text-[11px]">Lokasi Anda:</span>
                  <div className="flex items-center gap-1 font-bold text-white text-xs">
                    <span>Pusat Kendali (PUSDALOPS) Indramayu</span>
                  </div>
                </div>

                {/* Hero Content Petugas */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex-1 min-w-0 pr-1">
                    <h2 className="text-[15px] sm:text-base font-black tracking-tight text-white leading-tight uppercase">
                      PUSAT KENDALI OPERASI (PUSDALOPS)
                    </h2>
                    <p className="text-[11px] sm:text-xs text-[#D1E5E2] mt-1.5 leading-relaxed line-clamp-2">
                      Pantau laporan masuk, kerahkan armada SAR, dan kelola kapasitas posko evakuasi.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      {/* Tombol 1: Solid Putih / Teks Hijau */}
                      <Link
                        href="/petugas/peta-sar"
                        replace
                        scroll={false}
                        className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-full bg-white text-[#1D443F] text-[11px] sm:text-xs font-black shadow-md hover:bg-emerald-50 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#1D443F] shrink-0" />
                        <span>Peta SAR &amp; Evakuasi</span>
                      </Link>

                      {/* Tombol 2: Outline Putih */}
                      <Link
                        href="/petugas/triage"
                        replace
                        scroll={false}
                        className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-full bg-transparent border border-white/80 hover:bg-white/10 text-white text-[11px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>Antrean Triage</span>
                      </Link>
                    </div>
                  </div>

                  {/* Gambar Hero 3D */}
                  <Hero3DImage className="w-34 h-34 sm:w-38 sm:h-38 shrink-0" />
                </div>
              </motion.div>
            ) : (
              /* KONTEN HERO KESIAPSIAGAAN WARGA */
              <motion.div
                animate={{ y: isDashboard ? 0 : -60 }}
                transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] as const }}
                className="relative z-10 w-full flex flex-col justify-start mt-2"
              >
                {/* Dropdown Lokasi Warga */}
                <div className="flex items-center gap-1.5 text-xs text-white/90 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="text-white/70 text-[11px]">Lokasi Anda:</span>
                  <div className="flex items-center gap-1 font-bold text-white text-xs cursor-pointer hover:text-emerald-200">
                    <span>Kandanghaur, Indramayu</span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                  </div>
                </div>

                {/* Bagian Hero Content: Berjarak Simetris */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex-1 min-w-0 pr-1">
                    <h2 className="text-[17px] sm:text-lg font-black tracking-tight text-white leading-tight uppercase">
                      TANGGAP BANJIR, SATU SENTUHAN!
                    </h2>
                    <p className="text-[11px] sm:text-xs text-[#D1E5E2] mt-2 leading-relaxed line-clamp-2">
                      Layanan cepat, aman &amp; terpercaya untuk keselamatan warga Indramayu.
                    </p>
                    <div className="flex items-center gap-2 mt-4.5">
                      {/* 1. Tombol Rute (Lingkaran dengan Ikon ForkedRouteIcon dari Navbar) */}
                      <Link
                        href="/warga/evakuasi"
                        replace
                        scroll={false}
                        className="w-9.5 h-9.5 rounded-full bg-white text-[#1D443F] shadow-md hover:bg-emerald-50 flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer"
                        aria-label="Cek Rute Evakuasi"
                        title="Cek Rute Evakuasi"
                      >
                        <ForkedRouteIcon className="w-5 h-5 text-[#1D443F]" />
                      </Link>

                      {/* 2. Tombol Lapor (Ikon BeaconAlertIcon dari Navbar di Kiri & Tanpa Panah Kanan) */}
                      <Link
                        href="/warga/lapor"
                        replace
                        scroll={false}
                        className="h-9.5 inline-flex items-center gap-1.5 px-3.5 sm:px-4 rounded-full bg-white text-[#1D443F] text-[11px] sm:text-xs font-black shadow-md hover:bg-emerald-50 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        <BeaconAlertIcon className="w-4 h-4 shrink-0 text-[#1D443F]" />
                        <span>Laporkan Banjir</span>
                      </Link>
                    </div>
                  </div>

                  {/* Gambar Hero 3D Parallax & Floating Animation */}
                  <Hero3DImage className="w-34 h-34 sm:w-38 sm:h-38" />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* 2C. SIBLING 3: STICKY TOP APP BAR CONTROLS (z-40) */}
        {/* Berada di layer atas (z-40), transparan sehingga memperlihatkan green hero di bawahnya */}
        <header
          style={{
            height: "calc(60px + env(safe-area-inset-top, 0px))",
            marginTop: "calc(-1 * (60px + env(safe-area-inset-top, 0px)))",
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
          className="sticky top-0 z-40 w-full px-4 flex items-center justify-between bg-transparent pointer-events-auto"
        >
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-85 transition-opacity"
              title="Beranda DERMAYU"
            >
              <div className="relative w-8.5 h-8.5 shrink-0">
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isDashboard ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <LogoDermayu
                    variant="light"
                    width={34}
                    height={34}
                    className="w-8.5 h-8.5 object-contain"
                    priority
                  />
                </div>
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isDashboard ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <LogoDermayu
                    variant="dark"
                    width={34}
                    height={34}
                    className="w-8.5 h-8.5 object-contain"
                    priority
                  />
                </div>
              </div>
              <span
                className={`text-xl font-black tracking-wider transition-colors duration-300 ${
                  isDashboard ? "text-white" : "text-[#1D443F]"
                }`}
              >
                DERMAYU
              </span>
            </Link>
          </div>

          {/* Action Buttons: Search, Notifikasi Bell, Profil Avatar */}
          <div className="flex items-center gap-2.5">
            {/* Tombol Search Cepat */}
            {!isSearchOpen ? (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer ${
                  isDashboard
                    ? "bg-white text-[#1D443F] shadow-sm hover:bg-slate-100"
                    : "bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20 hover:bg-slate-100"
                }`}
                aria-label="Pencarian Cepat"
              >
                <Search className="w-4 h-4 text-[#1D443F] stroke-[2.5]" />
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}

            {/* Tombol Notifikasi Bell */}
            <div className="relative" ref={mobileNotifRef}>
              <button
                type="button"
                onClick={() => setMobileNotifOpen(!mobileNotifOpen)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer relative ${
                  isDashboard
                    ? "bg-white text-[#1D443F] shadow-sm hover:bg-slate-100"
                    : "bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20 hover:bg-slate-100"
                }`}
                aria-label="Notifikasi Siaga"
              >
                <Bell className="w-4 h-4 text-[#1D443F] stroke-[2.2]" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border border-white" />
                )}
              </button>

              {mobileNotifOpen && renderNotificationDropdown("right-0 mt-2")}
            </div>

            {/* Avatar Profil Inisial + Dropdown Menu */}
            <div className="relative" ref={mobileDropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center p-0.5 rounded-full cursor-pointer transition active:scale-95"
                aria-expanded={dropdownOpen}
                aria-label="Menu Pengguna"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#38746D] shrink-0 shadow-xs transition-all duration-300 ${
                    isDashboard
                      ? "bg-[#EEF5F3] border border-white/30"
                      : "bg-[#EEF5F3] border border-[#38746D]/20"
                  }`}
                >
                  {initial}
                </div>
              </button>

              {dropdownOpen && renderUserDropdownMenu()}
            </div>
          </div>
        </header>

        {/* 2D. SIBLING 4: SPACER DALAM FLOW DOKUMEN AGAR KONTEN BAWAH MELUNCUR HALUS */}
        <motion.div
          initial={false}
          animate={{ height: isDashboard ? 225 : 0 }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] as const }}
          className="w-full pointer-events-none"
        />
      </div>

      {/* 3. Fullscreen Search Overlay Mobile dengan Saran Kata Kunci & Live Results */}
      <MobileSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
