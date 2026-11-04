"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ThemeColorManager
 * Mengelola warna status bar perangkat mobile (jam, sinyal, baterai) secara dinamis & reaktif:
 * - Halaman Hijau (Dashboard Warga & Login/Register): #38746D & black-translucent
 * - Halaman Putih (Semua halaman fitur lain: Lapor, Evakuasi, Posko, dsb.): #ffffff & default (ikon gelap)
 */
export function ThemeColorManager() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Deteksi tema halaman saat ini
    const isGreenDashboard =
      pathname === "/warga/dashboard" ||
      pathname === "/dashboard" ||
      pathname === "/warga";
    const isAuth =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register");
    const isGreenTheme = isGreenDashboard || isAuth;

    const targetColor = isGreenTheme ? "#38746D" : "#ffffff";
    const appleStatus = isGreenTheme ? "black-translucent" : "default";

    // 2. Update atau buat <meta name="theme-color">
    let metaTheme = document.querySelectorAll('meta[name="theme-color"]');
    if (metaTheme.length === 0) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = targetColor;
      document.head.appendChild(meta);
    } else {
      metaTheme.forEach((el) => {
        el.setAttribute("content", targetColor);
      });
    }

    // 3. Update atau buat <meta name="apple-mobile-web-app-status-bar-style">
    let metaApple = document.querySelectorAll('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (metaApple.length === 0) {
      const meta = document.createElement("meta");
      meta.name = "apple-mobile-web-app-status-bar-style";
      meta.content = appleStatus;
      document.head.appendChild(meta);
    } else {
      metaApple.forEach((el) => {
        el.setAttribute("content", appleStatus);
      });
    }

    // 4. Update atau buat <meta name="msapplication-navbutton-color">
    let metaMs = document.querySelectorAll('meta[name="msapplication-navbutton-color"]');
    if (metaMs.length === 0) {
      const meta = document.createElement("meta");
      meta.name = "msapplication-navbutton-color";
      meta.content = targetColor;
      document.head.appendChild(meta);
    } else {
      metaMs.forEach((el) => {
        el.setAttribute("content", targetColor);
      });
    }

    // 5. Simpan ke CSS custom property pada root document
    document.documentElement.style.setProperty("--theme-color", targetColor);

    // 6. Dispatch event untuk tool / simulator yang me-listen event perubahan
    window.dispatchEvent(new CustomEvent("theme-color-changed", { detail: { color: targetColor } }));
  }, [pathname]);

  return null;
}
