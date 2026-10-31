"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ROUTES } from "@/data/dermayuData";
import { getActiveSession, getDashboardUrl, type UserSession } from "@/utils/authSession";
import { LogoDermayu } from "@/components/ui/LogoDermayu";

interface SiteHeaderProps {
  path?: string;
}

const navContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18, // Tempo kuda: jeda ketukan ritmis yang terasa jelas satu demi satu
      delayChildren: 0.25,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: 90 }, // Meluncur jauh dari luar sebelah kanan
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] as const }, // Paling lama, sangat halus & mewah
  },
};

export function SiteHeader({ path = "/" }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");
  const [session, setSession] = useState<UserSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Periksa active session dengan grace period 15 menit
  useEffect(() => {
    setIsMounted(true);

    const checkSession = () => {
      const active = getActiveSession();
      setSession(active);
    };

    checkSession();

    // Re-check saat window aktif kembali atau polling periodik setiap 15 detik
    window.addEventListener("focus", checkSession);
    const interval = setInterval(checkSession, 15 * 1000);

    return () => {
      window.removeEventListener("focus", checkSession);
      clearInterval(interval);
    };
  }, [pathname]);

  const hasActiveSession = isMounted && session !== null;
  const dashboardHref = session ? getDashboardUrl(session.role) : "/login";

  useEffect(() => {
    // Jika berada di halaman /panduan, set active ke panduan
    if (pathname === "/panduan") {
      setActiveSection("panduan");
      return;
    }

    // Scroll-spy untuk section anchor di landing page
    const handleScroll = () => {
      // Jika masih di paling atas layar (< 150px), aktifkan beranda
      if (window.scrollY < 150) {
        setActiveSection("beranda");
        return;
      }

      const scrollPosition = window.scrollY + 140; // Offset navbar

      // Periksa dari bawah ke atas
      const sections = ["faq", "cara-kerja", "fitur", "tentang", "beranda"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Jalankan sekali saat mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <motion.header
      key={pathname}
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
      className="sticky top-0 z-50 border-b border-[#E8F1EE] bg-white/95 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 w-full">
        {/* Kolom Kiri: Logo & Brand DERMAYU (Meluncur Halus dari Kiri) */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          className="flex items-center gap-3 shrink-0"
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <LogoDermayu
              variant="dark"
              width={36}
              height={36}
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-200 shrink-0"
              priority
            />
            <span className="text-xl font-extrabold tracking-tight text-[#1D443F] group-hover:text-[#38746D] transition-colors">
              DERMAYU
            </span>
          </Link>
        </motion.div>

        {/* Kolom Tengah: Menu Navigasi Desktop (Tempo Kuda: Satu Persatu dari Luar Layar Kanan) */}
        <motion.nav
          aria-label="Menu Utama"
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
          className="hidden md:flex items-center gap-8"
        >
          {ROUTES.map((r) => {
            const isActive =
              pathname === "/panduan"
                ? r.sectionId === "panduan"
                : activeSection === r.sectionId;

            return (
              <motion.div key={r.href} variants={navItemVariants}>
                <Link
                  href={r.href}
                  onClick={() => {
                    if (r.sectionId) setActiveSection(r.sectionId);
                  }}
                  className={`text-sm transition-colors whitespace-nowrap block ${
                    isActive
                      ? "text-[#38746D] font-bold"
                      : "text-[#4B635F] font-medium hover:text-[#132422]"
                  }`}
                >
                  {r.label}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* Kolom Kanan: Tombol Aksi Desktop (Paling Lama & Mendarat Lembut dari Jauh di Kanan) */}
        <motion.div
          initial={{ opacity: 0, x: 110 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.85, ease: [0.16, 1, 0.3, 1] as const }}
          className="hidden md:flex items-center gap-3 shrink-0"
        >
          {hasActiveSession ? (
            <Link
              href={dashboardHref}
              className="rounded-full bg-[#1D443F] hover:bg-[#38746D] px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-all duration-150 hover:shadow-md active:scale-95 whitespace-nowrap inline-flex items-center"
            >
              Kembali ke Dasbor
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[#A4C6C1] bg-white px-6 py-2.5 text-sm font-medium text-[#2E6A63] shadow-2xs transition-all duration-150 hover:bg-[#EEF5F3] hover:border-[#38746D] active:scale-95 whitespace-nowrap"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#38746D] px-6 py-2.5 text-sm font-medium text-white shadow-xs transition-all duration-150 hover:bg-[#24544E] active:scale-95 whitespace-nowrap"
              >
                Mulai sekarang
              </Link>
            </>
          )}
        </motion.div>

        {/* Mobile Header Menu Trigger */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
          className="flex items-center gap-2 md:hidden"
        >
          {hasActiveSession ? (
            <Link
              href={dashboardHref}
              className="inline-flex items-center rounded-full bg-[#1D443F] text-white px-3.5 py-1.5 text-xs font-bold shadow-2xs hover:bg-[#38746D] active:scale-95 transition-all whitespace-nowrap"
            >
              Dasbor
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-[#A4C6C1] bg-white px-3.5 py-1.5 text-xs font-medium text-[#2E6A63] shadow-2xs hover:bg-[#EEF5F3] active:scale-95 transition-all"
            >
              Masuk
            </Link>
          )}
          <button
            type="button"
            className="rounded-full p-2 text-[#132422] hover:bg-[#EEF5F3] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38746D] cursor-pointer"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </motion.div>
      </div>

      {/* ========================================================= */}
      {/* DROPDOWN MENU MOBILE (FLOATING OVERLAY - ZERO LAYOUT SHIFT)*/}
      {/* ========================================================= */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop Gelap Transparan di Belakang Menu Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-[68px] bg-slate-900/25 backdrop-blur-[2px] md:hidden z-40"
              aria-hidden="true"
            />

            {/* Menu Mobile Floating Melayang Menimpa Layar */}
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-[#D5E4E0] shadow-2xl px-6 py-6 flex flex-col gap-4 md:hidden z-50 max-h-[calc(100vh-72px)] overflow-y-auto"
            >
              <ul className="flex flex-col gap-3">
                {ROUTES.map((r) => {
                  const isActive =
                    pathname === "/panduan"
                      ? r.sectionId === "panduan"
                      : activeSection === r.sectionId;

                  return (
                    <li key={r.href}>
                      <Link
                        href={r.href}
                        onClick={() => {
                          if (r.sectionId) setActiveSection(r.sectionId);
                          setOpen(false);
                        }}
                        className={`text-sm block py-1.5 font-semibold transition-colors ${
                          isActive
                            ? "text-[#38746D]"
                            : "text-[#4B635F] hover:text-[#132422]"
                        }`}
                      >
                        {r.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="pt-3 border-t border-[#E8F1EE] flex flex-col gap-3">
                {hasActiveSession ? (
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="w-full text-center py-3 rounded-full bg-[#1D443F] hover:bg-[#38746D] text-white text-sm font-bold shadow-sm transition-colors block"
                  >
                    Kembali ke Dasbor
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="w-full text-center py-2.5 rounded-full border border-[#D5E4E0] bg-white text-sm font-semibold text-[#132422] hover:bg-gray-50 transition-colors shadow-2xs"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="w-full text-center py-2.5 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-sm font-semibold shadow-sm transition-colors"
                    >
                      Mulai sekarang
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
