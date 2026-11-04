'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * DynamicThemeColor
 * Mengelola sinkronisasi warna Status Bar & Safe Area perangkat mobile secara dinamis:
 * - Halaman Hijau (Dashboard Warga/Petugas & Auth Login/Register): #38746D & black-translucent (teks/ikon putih)
 * - Halaman Putih (Landing Page '/', Evakuasi, Posko, Lapor, Komunitas, Profil): #FFFFFF & default (teks/ikon gelap)
 */
export default function DynamicThemeColor() {
  const pathname = usePathname();

  useEffect(() => {
    // Tentukan halaman mana yang pakai header hijau
    const isGreenPage =
      pathname === '/dashboard' ||
      pathname === '/warga/dashboard' ||
      pathname === '/warga' ||
      pathname === '/petugas/dashboard' ||
      pathname === '/petugas' ||
      pathname === '/login' ||
      pathname.startsWith('/login/') ||
      pathname === '/register' ||
      pathname.startsWith('/register/');

    const targetColor = isGreenPage ? '#38746D' : '#FFFFFF';
    const appleStatusStyle = isGreenPage ? 'black-translucent' : 'default';

    // 1. Update atau buat meta name="theme-color" (semua tag yang ada)
    const themeMetaList = document.querySelectorAll('meta[name="theme-color"]');
    if (themeMetaList.length === 0) {
      const themeMeta = document.createElement('meta');
      themeMeta.setAttribute('name', 'theme-color');
      themeMeta.setAttribute('content', targetColor);
      document.head.appendChild(themeMeta);
    } else {
      themeMetaList.forEach((el) => {
        el.setAttribute('content', targetColor);
      });
    }

    // 2. Update status bar iOS / WebKit
    const appleMetaList = document.querySelectorAll('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleMetaList.length === 0) {
      const appleMeta = document.createElement('meta');
      appleMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      appleMeta.setAttribute('content', appleStatusStyle);
      document.head.appendChild(appleMeta);
    } else {
      appleMetaList.forEach((el) => {
        el.setAttribute('content', appleStatusStyle);
      });
    }

    // 3. Update msapplication-navbutton-color
    const msMetaList = document.querySelectorAll('meta[name="msapplication-navbutton-color"]');
    if (msMetaList.length === 0) {
      const msMeta = document.createElement('meta');
      msMeta.setAttribute('name', 'msapplication-navbutton-color');
      msMeta.setAttribute('content', targetColor);
      document.head.appendChild(msMeta);
    } else {
      msMetaList.forEach((el) => {
        el.setAttribute('content', targetColor);
      });
    }

    // 4. Dispatch event untuk tool / simulator viewer (tanpa memutasi style pada html untuk mencegah hydration mismatch)
    try {
      window.dispatchEvent(
        new CustomEvent('theme-color-changed', {
          detail: { color: targetColor, appleStatus: appleStatusStyle },
        })
      );
    } catch {}
  }, [pathname]);

  return null;
}
