"use client";

import { useState, useEffect } from "react";

/**
 * useIsPwa
 * Mendeteksi apakah aplikasi sedang berjalan dalam mode PWA Standalone terpasang
 * (bukan sekadar browser web biasa atau responsif mobile di Safari/Chrome).
 */
export function useIsPwa(): boolean {
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkPwa = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isStandalone =
        urlParams.get("pwa") === "true" ||
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");

      setIsPwa(Boolean(isStandalone));
    };

    checkPwa();

    try {
      const mql = window.matchMedia("(display-mode: standalone)");
      mql.addEventListener("change", checkPwa);
      return () => mql.removeEventListener("change", checkPwa);
    } catch {
      // Fallback for older browsers
    }
  }, []);

  return isPwa;
}
