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
      // Pada mode development / localhost, bersihkan service worker agar tidak merusak Turbopack HMR & navigasi
      const isDev =
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isDev) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
            console.log("[DERMAYU PWA] Unregistered Service Worker for development mode:", reg.scope);
          }
        });
        return;
      }

      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
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
