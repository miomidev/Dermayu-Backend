"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegister
 * Mendaftarkan Service Worker PWA dengan scope "/" pada navigator browser
 * Memenuhi kriteria Google Chrome WebAPK sehingga PWA berjalan murni native standalone
 * tanpa bilah URL / Chrome Custom Tab.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("[DERMAYU PWA] Service Worker aktif pada scope:", registration.scope);
          })
          .catch((err) => {
            console.error("[DERMAYU PWA] Gagal mendaftarkan Service Worker:", err);
          });
      });
    }
  }, []);

  return null;
}

