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
import {
  Bell,
  X,
  ChevronRight,
} from "lucide-react";
import { MobileSearchOverlay, searchableData, type SearchItem } from "@/components/dashboard/MobileSearchOverlay";
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
            className="text-[10px] font-semibold text-[#155E45] hover:underline cursor-pointer"
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
                      {!isSearchOpen ? (
                        <motion.button
                          layoutId="mobile-search-pill"
                          type="button"
                          onClick={() => setIsSearchOpen(true)}
                          className="w-9 h-9 rounded-full bg-white text-[#1D443F] shadow-sm flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
                          aria-label="Pencarian Cepat"
                        >
                          <Search className="w-4 h-4 text-[#1D443F] stroke-[2.5]" />
                        </motion.button>
                      ) : (
                        <div className="w-9 h-9" />
                      )}

                      {/* Tombol Notifikasi Bell di Antara Search dan Profil */}
                      <div className="relative" ref={mobileNotifRef}>
                        <button
                          type="button"
                          onClick={() => setMobileNotifOpen(!mobileNotifOpen)}
                          className="w-9 h-9 rounded-full bg-white text-[#1D443F] shadow-sm flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer relative"
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

              <div className="flex items-center gap-2">
                {/* Tombol Search Cepat Halaman Fitur */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="w-9 h-9 rounded-full bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20 flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
                  aria-label="Pencarian Cepat"
                >
                  <Search className="w-4 h-4 text-[#1D443F] stroke-[2.5]" />
                </button>

                {/* Tombol Notifikasi Bell Halaman Fitur */}
                <div className="relative" ref={mobileCleanNotifRef}>
                  <button
                    type="button"
                    onClick={() => setMobileNotifOpen(!mobileNotifOpen)}
                    className="w-9 h-9 rounded-full bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20 flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer relative"
                    aria-label="Notifikasi Siaga"
                  >
                    <Bell className="w-4 h-4 text-[#1D443F] stroke-[2.2]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border border-white" />
                    )}
                  </button>

                  {mobileNotifOpen && renderNotificationDropdown("right-0 mt-2")}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Fullscreen Search Overlay Mobile dengan Saran Kata Kunci & Live Results */}
      <MobileSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
