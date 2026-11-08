// Service Worker DERMAYU PWA (Native Standalone & Offline Support)
const CACHE_NAME = "dermayu-pwa-v4";

const PRECACHE_ASSETS = [
  "/",
  "/warga/evakuasi",
  "/warga/lapor",
  "/data/geojson/infrastruktur_pengendali_air_indramayu.geojson",
  "/data/geojson/titik_rawan_banjir_indramayu.geojson",
  "/data/geojson/sekolah_posko_banjir_indramayu.geojson",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
  "/manifest.json",
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DERMAYU | Mode Darurat Offline</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0E2925; color: #E6F3F0; margin: 0; padding: 24px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; }
    .card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(82, 196, 170, 0.25); border-radius: 24px; max-width: 480px; width: 100%; padding: 28px 24px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #FEF3C7; color: #92400E; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; margin: 0 0 8px; color: #FFFFFF; }
    p { font-size: 14px; color: #94A3B8; line-height: 1.5; margin: 0 0 24px; }
    .btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px 18px; border-radius: 14px; font-weight: 700; font-size: 14px; text-decoration: none; margin-bottom: 10px; box-sizing: border-box; cursor: pointer; border: none; }
    .btn-primary { background: #38746D; color: #FFFFFF; }
    .btn-secondary { background: rgba(255, 255, 255, 0.1); color: #E6F3F0; border: 1px solid rgba(255, 255, 255, 0.15); }
    .btn-danger { background: #EF4444; color: #FFFFFF; }
    .btn-retry { background: transparent; color: #52C4AA; border: 1px solid #52C4AA; margin-top: 8px; }
    .hint { font-size: 11px; color: #64748B; margin-top: 16px; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">📡 Mode Darurat Offline Aktif</div>
    <h1>Koneksi Internet Terputus</h1>
    <p>Aplikasi DERMAYU tetap siap siaga. Anda dapat menggunakan formulir laporan darurat offline atau menghubungi tim tanggap bencana.</p>
    
    <a href="/warga/lapor" class="btn btn-primary">📝 Buka Form Lapor Banjir (Offline)</a>
    <a href="/warga/evakuasi" class="btn btn-secondary">🧭 Buka Peta Evakuasi & Posko</a>
    <a href="tel:112" class="btn btn-danger">📞 Panggilan Darurat Call Center 112</a>
    <button onclick="window.location.reload()" class="btn btn-retry">🔄 Coba Sambungkan Kembali</button>
    
    <div class="hint">Laporan Anda saat offline akan disimpan di memori perangkat dan dikirim otomatis ke posko BPBD begitu sinyal pulih.</div>
  </div>
</body>
</html>`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Gunakan Promise.allSettled agar kegagalan 1 aset tidak membatalkan caching aset lain
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "reload" });
            if (res && res.status === 200) {
              await cache.put(url, res);
            }
          } catch (e) {
            console.warn("[DERMAYU PWA] Precache warning for:", url, e);
          }
        })
      );
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  // Hanya proses request GET http/https
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  const url = new URL(event.request.url);

  // Jangan ganggu koneksi dev server HMR Turbopack / Next.js
  if (
    url.pathname.includes("webpack-hmr") ||
    url.pathname.includes("turbopack-hmr") ||
    event.request.headers.get("upgrade") === "websocket"
  ) {
    return;
  }

  // 1. Data Statis GeoJSON Spasial (Cache-First)
  if (url.pathname.startsWith("/data/geojson/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkRes;
          })
          .catch(() => cached || new Response("{}", { status: 200 }));
      })
    );
    return;
  }

  // 2. Chunks Statis Next.js JS & CSS (Stale-While-Revalidate / Cache-First)
  // Menjaga agar komponen dinamis seperti Leaflet Map tetap jalan saat offline
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkRes;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3. Tile OpenStreetMap Map (Cache-First dengan fallback)
  if (url.hostname.includes("tile.openstreetmap.org")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkRes;
          })
          .catch(() => cached || new Response("", { status: 408 }));
      })
    );
    return;
  }

  // 4. Lewatkan API internal backend Next.js (ditangani fallback di level kode React)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 5. Navigasi Halaman Utama (Network-First dengan Fallback Offline HTML Darurat)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          // Cari exact match di cache
          const exactMatch = await caches.match(event.request);
          if (exactMatch) return exactMatch;

          // Cari berdasarkan pathname
          const pathMatch = await caches.match(url.pathname);
          if (pathMatch) return pathMatch;

          // Fallback spesifik rute
          if (url.pathname.includes("/warga/lapor")) {
            const laporMatch = await caches.match("/warga/lapor");
            if (laporMatch) return laporMatch;
          }

          if (url.pathname.includes("/warga/evakuasi")) {
            const evakuasiMatch = await caches.match("/warga/evakuasi");
            if (evakuasiMatch) return evakuasiMatch;
          }

          const rootMatch = await caches.match("/");
          if (rootMatch) return rootMatch;

          // Jika tidak ada di cache sama sekali, sajikan UI Darurat Dermayu (Bukan Dino!)
          return new Response(OFFLINE_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
            status: 200,
          });
        })
    );
    return;
  }

  // 6. Request Aset Umum (Gambar, Icon, Font)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => cached || new Response("", { status: 404 }));
    })
  );
});
