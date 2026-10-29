"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ROUTES } from "@/data/dermayuData";

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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#38746D] text-white shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
              <Image
                src="/dermayu-logo.webp"
                alt="Logo DERMAYU"
                width={22}
                height={22}
                className="object-contain w-5 h-5"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#132422]">
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
        </motion.div>

        {/* Mobile Header Menu Trigger */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
          className="flex items-center gap-2 md:hidden"
        >
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-[#A4C6C1] bg-white px-3.5 py-1.5 text-xs font-medium text-[#2E6A63] shadow-2xs hover:bg-[#EEF5F3] active:scale-95 transition-all"
          >
            Masuk
          </Link>
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

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="border-t border-[#E8F1EE] bg-white px-6 py-5 md:hidden shadow-lg"
          >
            <ul className="flex flex-col gap-3.5">
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
                      className={`text-sm block py-1 transition-colors ${
                        isActive
                          ? "text-[#38746D] font-bold"
                          : "text-[#4B635F] font-medium hover:text-[#132422]"
                      }`}
                    >
                      {r.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex flex-col gap-2.5 pt-4 border-t border-[#E8F1EE]">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full text-center rounded-full border border-[#A4C6C1] bg-white py-2.5 text-sm font-medium text-[#2E6A63] hover:bg-[#EEF5F3] shadow-2xs transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="w-full text-center rounded-full bg-[#38746D] py-2.5 text-sm font-medium text-white hover:bg-[#24544E] shadow-xs transition-colors"
              >
                Mulai sekarang
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
