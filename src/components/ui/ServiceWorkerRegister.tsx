"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegister
 * Mendaftarkan Service Worker PWA dengan scope "/" pada navigator browser.
 * Mengatasi edge-case Next.js SPA di mana window 'load' event sudah terlewat
 * saat komponen dirender, sehingga Service Worker selalu terdaftar & aktif seketika.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          // Segera update service worker ke versi terbaru
          registration.update();
          console.log("[DERMAYU PWA] Service Worker aktif pada scope:", registration.scope);
        } catch (err) {
          console.error("[DERMAYU PWA] Gagal mendaftarkan Service Worker:", err);
        }
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  return null;
}
