"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

interface PwaBackHandlerProps {
  role: "warga" | "petugas";
}

/**
 * PwaBackHandler
 * Mengelola UX tombol Back fisik/gesture di Android/iOS khusus mode PWA Standalone:
 * 1. Jika di sub-fitur (Rute, Posko, Lapor, dll.) -> Back langsung kembali ke Dasbor Utama tanpa melacak riwayat tab acak.
 * 2. Jika di Dasbor Utama -> Tekan Back pertama kali memicu toast konfirmasi "Tekan sekali lagi untuk keluar dari aplikasi",
 *    tekanan kedua dalam 2 detik akan membiarkan aplikasi keluar ke home screen HP secara native.
 * 3. Tidak memengaruhi perilaku browser desktop atau browser non-standalone normal.
 */
export function PwaBackHandler({ role }: PwaBackHandlerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showExitToast, setShowExitToast] = useState(false);
  const lastPressRef = useRef<number>(0);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dashboardUrl = role === "petugas" ? "/petugas/dashboard" : "/warga/dashboard";

  const isMainDashboard =
    role === "petugas"
      ? pathname === "/petugas/dashboard" || pathname === "/petugas"
      : pathname === "/warga/dashboard" ||
        pathname === "/dashboard" ||
        pathname === "/warga" ||
        pathname === "/";

  useEffect(() => {
    // 1. Deteksi apakah aplikasi berjalan dalam mode PWA Standalone di perangkat mobile
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    const isMobile = window.innerWidth < 768;

    // Batasan scope: Hanya aktif pada mode PWA standalone mobile
    if (!isStandalone || !isMobile) return;

    // 2. Injeksi trap state ke history stack agar event popstate dapat di-intercept
    try {
      if (!window.history.state || !window.history.state.dermayuPwaTrap) {
        window.history.pushState({ dermayuPwaTrap: true }, "");
      }
    } catch {
      // Ignore security/history error
    }

    const handlePopState = (e: PopStateEvent) => {
      // A. Jika pengguna berada di halaman sub-fitur (Rute, Posko, Lapor, dll.)
      if (!isMainDashboard) {
        // Alihkan langsung ke dasbor utama tanpa menyusuri riwayat tab per tab
        router.replace(dashboardUrl, { scroll: false });
        return;
      }

      // B. Jika pengguna sudah berada di halaman Dasbor Utama
      const now = Date.now();
      const timeDiff = now - lastPressRef.current;

      if (timeDiff < 2000) {
        // Tekanan kedua dalam 2 detik: Izinkan aplikasi menutup ke Home Screen ponsel
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setShowExitToast(false);
        window.history.back();
      } else {
        // Tekanan pertama: Tahan navigasi dan tampilkan toast konfirmasi keluar
        lastPressRef.current = now;

        // Pasang kembali trap state agar back berikutnya tertangkap
        try {
          window.history.pushState({ dermayuPwaTrap: true }, "");
        } catch {}

        setShowExitToast(true);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
          setShowExitToast(false);
        }, 2000);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [pathname, isMainDashboard, dashboardUrl, router]);

  return (
    <AnimatePresence>
      {showExitToast && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-white/15 pointer-events-none flex items-center gap-2.5 select-none whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>Tekan sekali lagi untuk keluar dari aplikasi</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

