"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Megaphone,
  Droplets,
  LogIn,
  X,
  AlertCircle,
  WifiOff,
  CloudRain,
  CloudSun,
  Sun,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FLOOD_OBSTACLES, REALISTIC_FLOOD_PHOTOS } from "@/data/curatedEvakuasiData";
import { getWargaPosko, fetchPoskoFromApi, type PoskoRecord } from "@/utils/poskoService";
import type {
  MapReportPoint,
  MapShelterPoint,
  MapTelemetryPoint,
} from "@/components/dashboard/WargaSpatialMap";
import {
  WeatherDetailPanel,
  type DetailedWeatherData,
  DEFAULT_DETAILED_WEATHER,
} from "@/components/weather/WeatherDetailPanel";

// Fallback saat Leaflet Map sedang dimuat
function MapLoadingFallback() {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50/80 p-6 text-center select-none">
      <div className="w-12 h-12 rounded-2xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center mb-3 animate-spin">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="30 60" />
        </svg>
      </div>
      <p className="text-sm font-bold text-[#132422]">Memuat Peta Spasial Indramayu...</p>
      <p className="text-xs text-slate-500 mt-1 max-w-xs">
        Menghubungkan data telemetri sensor, titik posko, dan pantauan genangan terkini.
      </p>
    </div>
  );
}

// Dynamic import untuk Leaflet Spatial Map (SSR dimatikan)
const WargaSpatialMap = dynamic(
  () => import("@/components/dashboard/WargaSpatialMap"),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />,
  }
);

export default function PetaSpasialPage() {
  const [showLaporModal, setShowLaporModal] = useState(false);
  const [isWeatherPanelOpen, setIsWeatherPanelOpen] = useState(false);
  const [wargaPoskoData, setWargaPoskoData] = useState<PoskoRecord[]>([]);
  const [weatherData, setWeatherData] = useState<DetailedWeatherData>(DEFAULT_DETAILED_WEATHER);

  // Telemetri awal (10 Titik Pantau Infrastruktur Air Indramayu)
  const [telemetryPoints, setTelemetryPoints] = useState<MapTelemetryPoint[]>([
    {
      id: "INFRA-AIR-001",
      name: "Bendung Rentang (Pusat Kendali Cimanuk)",
      code: "INFRA-01",
      waterLevel: "310 m³/s (25.8% Kapasitas)",
      status: "NORMAL",
      trend: "STABIL",
      lastUpdate: "Sinkron Satelit GloFAS & BMKG",
      lat: -6.6626,
      lng: 108.2209,
      tipeBangunan: "Bendung Gerak Radial Utama",
      lokasiDetail: "Panongan, Jatitujuh - Kertasmaya",
      district: "Kertasmaya",
      agency: "BBWS Cimanuk Cisanggarung (PUPR)",
      impactAreas: "Desa Tulungagung, Sukawera, Sindang",
      currentValue: 310,
      unit: "m³/s",
      rawStatus: "Kondisi Stabil",
    },
    {
      id: "INFRA-AIR-002",
      name: "Bendung Bangkir (Pembagi Aliran)",
      code: "INFRA-02",
      waterLevel: "185 m³/s (TMA 7.2 mdpl)",
      status: "WASPADA",
      trend: "STABIL",
      lastUpdate: "Sinkron Satelit GloFAS & BMKG",
      lat: -6.3856,
      lng: 108.2928,
      tipeBangunan: "Bendung Pembagi Aliran",
      lokasiDetail: "Desa Rambatan Wetan, Lohbener",
      district: "Lohbener",
      agency: "BBWS Cimanuk Cisanggarung",
      impactAreas: "Bantaran Sindang & Paoman",
      currentValue: 185,
      unit: "m³/s",
      rawStatus: "Kondisi Waspada",
    },
    {
      id: "INFRA-AIR-003",
      name: "Pintu Air Saluran Induk Barat (Cipelang)",
      code: "INFRA-03",
      waterLevel: "45 m³/s (Normal)",
      status: "NORMAL",
      trend: "STABIL",
      lastUpdate: "Sensor Aliran Irigasi",
      lat: -6.6612,
      lng: 108.2198,
      tipeBangunan: "Pintu Pengatur Intake Irigasi",
      lokasiDetail: "Kertasmaya, Perbatasan Majalengka",
      district: "Kertasmaya",
      agency: "BBWS Cimanuk Cisanggarung",
      impactAreas: "Kawasan Sawah Irigasi Barat",
      currentValue: 45,
      unit: "m³/s",
      rawStatus: "Kondisi Normal",
    },
    {
      id: "INFRA-AIR-005",
      name: "Stasiun Pompa Polder Karangsong",
      code: "INFRA-05",
      waterLevel: "+85 cm (Siaga Rob Pasang)",
      status: "SIAGA",
      trend: "NAIK",
      lastUpdate: "Radar Pompa Polder",
      lat: -6.312,
      lng: 108.365,
      tipeBangunan: "Stasiun Pompa Banjir Polder Pesisir",
      lokasiDetail: "Muara Prajagumiwang & Pelabuhan Karangsong",
      district: "Indramayu",
      agency: "Dinas PUPR Kabupaten Indramayu",
      impactAreas: "Permukiman Nelayan & TPI Karangsong",
      currentValue: 85,
      unit: "cm",
      rawStatus: "Siaga / Level 2",
    },
    {
      id: "INFRA-AIR-006",
      name: "Pintu Air Muara Kali Ciputih (Eretan Wetan)",
      code: "INFRA-06",
      waterLevel: "+65 cm (Pasang Rob)",
      status: "SIAGA",
      trend: "NAIK",
      lastUpdate: "Radar Pemantau Pesisir",
      lat: -6.3468,
      lng: 108.1182,
      tipeBangunan: "Pintu Klep Pengendali Rob Pesisir",
      lokasiDetail: "Eretan Wetan, Kandanghaur",
      district: "Kandanghaur",
      agency: "Dinas PUPR / BPBD Indramayu",
      impactAreas: "Permukiman Blok Mina & TPI Eretan",
      currentValue: 65,
      unit: "cm",
      rawStatus: "Siaga / Level 2",
    },
  ]);

  // 1. Fetch Posko Evakuasi Terkurasi
  useEffect(() => {
    let isMounted = true;
    async function loadPosko() {
      try {
        const data = await fetchPoskoFromApi("warga");
        if (isMounted) {
          setWargaPoskoData(data.filter((p) => p.isActive === true));
        }
      } catch (err) {
        if (isMounted) {
          setWargaPoskoData(getWargaPosko());
        }
      }
    }
    loadPosko();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Data Cuaca Real-Time Open-Meteo Indramayu
  useEffect(() => {
    let isMounted = true;
    fetch("/api/v1/weather")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data cuaca");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data) {
          const w = data.data || data;
          setWeatherData((prev) => ({
            ...prev,
            ...w,
            suhu: typeof w.suhu === "number" ? Math.round(w.suhu) : prev.suhu,
            kondisiSekarang: w.kondisiSekarang || prev.kondisiSekarang,
            weatherCode: typeof w.weatherCode === "number" ? w.weatherCode : prev.weatherCode,
            hourly: Array.isArray(w.hourly) && w.hourly.length > 0 ? w.hourly : prev.hourly,
            daily: Array.isArray(w.daily) && w.daily.length > 0 ? w.daily : prev.daily,
            metrics: w.metrics ? { ...prev.metrics, ...w.metrics } : prev.metrics,
            peringatanHujan: w.peringatanHujan !== undefined ? w.peringatanHujan : prev.peringatanHujan,
          }));
        }
      })
      .catch((err) => {
        console.warn("Weather API load fallback:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Fetch Data Telemetri Terhubung REST API
  useEffect(() => {
    let isMounted = true;
    async function loadTelemetry() {
      try {
        const res = await fetch("/api/telemetry");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.stations)) {
          setTelemetryPoints(
            data.stations.map((s: any) => ({
              id: s.id,
              name: s.name,
              waterLevel: s.waterLevel,
              status: s.status,
              trend: s.trend,
              lastUpdate: s.lastUpdate,
              lat: s.lat,
              lng: s.lng,
              tipeBangunan: s.tipeBangunan,
              lokasiDetail: s.lokasiDetail,
              district: s.kecamatan,
              agency: s.instansiPengelola,
              impactAreas: s.potensiDampakHilir,
              isLive: data.isLiveExternal,
              debit: s.debitSaatIniM3s,
              capacity: s.kapasitasDesainM3s,
            }))
          );
        }
      } catch (err) {
        console.warn("Gagal sinkron telemetri:", err);
      }
    }
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Format Map Shelter Points
  const mapShelterPoints: MapShelterPoint[] = useMemo(() => {
    return wargaPoskoData.map((p) => {
      const isKemdikbudPhoto = p.foto && p.foto.includes("kemendikdasmen.go.id");
      const rawPhotos = isKemdikbudPhoto
        ? [p.foto]
        : p.photos && p.photos.length > 0
        ? p.photos
        : p.fotos && p.fotos.length > 0
        ? p.fotos
        : p.foto
        ? [p.foto]
        : [];
      const photos = rawPhotos.filter((f) => typeof f === "string" && !f.includes("default.jpg"));
      return {
        id: p.id,
        name: p.nama,
        location: p.alamat,
        district: p.kecamatan,
        distance: "Menghitung jarak...",
        capacityTotal: p.kapasitas,
        capacityFilled: p.terisi,
        status: p.status,
        contactPerson: p.kontak.pj,
        contactPhone: p.kontak.telp,
        lat: p.lat,
        lng: p.lng,
        facilities: p.fasilitas,
        kategori: p.kategori,
        foto: photos[0] || p.foto || "",
        fotos: photos,
        photos: photos,
        tier: p.tier,
      };
    });
  }, [wargaPoskoData]);

  // Format Map Report Points (Genangan Air & Hambatan Jalan)
  const mapReportPoints: MapReportPoint[] = useMemo(() => {
    return FLOOD_OBSTACLES.map((obs, idx) => ({
      id: obs.id,
      ticketCode: `GEN-${String(idx + 1).padStart(3, "0")}`,
      title: obs.title,
      category: obs.zone === "PESISIR_ROB" ? "Banjir Rob" : "Luapan DAS Cimanuk",
      severity: obs.severity,
      waterLevelText: `${obs.depthCm} cm`,
      status: obs.status,
      location: obs.location,
      lat: obs.lat,
      lng: obs.lng,
      timeAgo: "Aktif",
      photos: [REALISTIC_FLOOD_PHOTOS[idx % REALISTIC_FLOOD_PHOTOS.length]],
      photoUrl: REALISTIC_FLOOD_PHOTOS[idx % REALISTIC_FLOOD_PHOTOS.length],
      note: obs.description,
    }));
  }, []);

  // Helper Ikon Cuaca Profesional (Lucide Vector, Tanpa Emoji)
  const weatherIconNode = useMemo(() => {
    const k = (weatherData?.kondisiSekarang || "Cerah Berawan").toLowerCase();
    if (k.includes("hujan") || k.includes("badai") || k.includes("petir")) {
      return <CloudRain className="w-5 h-5 md:w-6 md:h-6 text-sky-500 mb-0.5 sm:mb-1 shrink-0" />;
    }
    if (k.includes("berawan") || k.includes("mendung")) {
      return <CloudSun className="w-5 h-5 md:w-6 md:h-6 text-amber-500 mb-0.5 sm:mb-1 shrink-0" />;
    }
    return <Sun className="w-5 h-5 md:w-6 md:h-6 text-amber-500 mb-0.5 sm:mb-1 shrink-0" />;
  }, [weatherData?.kondisiSekarang]);

  // Widget Mengambang Kontrol Peta:
  // - Mobile: Di kiri bawah peta (di bawah tombol satelit), urutan: Cuaca dulu (kiri), baru Tombol Laporan (kanan). Sisi bawah sejajar (items-end).
  // - Desktop: Di kanan atas peta, urutan: Tombol Laporan (kiri), Card Cuaca (kanan / paling pojok). Sisi atas sejajar (md:items-start).
  const floatingTopRight = (
    <>
      {/* 1. CARD CUACA PROFESIONAL (TRIGGER DETAIL FORECAST) */}
      {/* Mobile: Tampil di KIRI (order-1) | Desktop: Tampil di KANAN paling pojok (md:order-2) */}
      <button
        type="button"
        onClick={() => setIsWeatherPanelOpen(true)}
        title={`Cuaca di Indramayu: ${weatherData?.kondisiSekarang || "Cerah Berawan"} (${weatherData?.suhu ?? 28}°C) — Klik untuk melihat prakiraan detail 24 jam & 7 hari`}
        aria-label="Buka Detail Prakiraan Cuaca Indramayu"
        className="order-1 md:order-2 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl shadow-lg p-2 sm:p-2.5 md:p-4 flex flex-col items-center justify-center min-w-[76px] sm:min-w-[88px] md:min-w-[100px] cursor-pointer hover:bg-slate-50 hover:border-slate-300 hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all shrink-0 select-none group"
      >
        {/* Ikon Lucide Profesional */}
        {weatherIconNode}

        {/* Suhu (Besar & Bold) */}
        <span className="text-sm sm:text-base md:text-xl font-bold text-slate-800 leading-none tracking-tight group-hover:text-slate-900">
          {weatherData?.suhu ?? 28}°C
        </span>

        {/* Label Kondisi Cuaca (Kecil / Medium) */}
        <span className="text-[9.5px] sm:text-[11px] md:text-xs font-medium text-slate-600 mt-0.5 sm:mt-1 text-center whitespace-nowrap group-hover:text-slate-800">
          {weatherData?.kondisiSekarang || "Cerah Berawan"}
        </span>
      </button>

      {/* 2. TOMBOL LAPORAN BANJIR */}
      {/* Mobile: Tampil di KANAN (order-2) | Desktop: Tampil di KIRI (md:order-1) */}
      <button
        type="button"
        onClick={() => setShowLaporModal(true)}
        className="order-2 md:order-1 bg-dermayu-primary text-white px-3.5 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3 rounded-xl shadow-md font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 hover:bg-dermayu-dark transition-colors cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
      >
        <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-white" />
        <span>Laporan Banjir</span>
      </button>
    </>
  );

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-slate-50 text-[#132422]">
      {/* 1. Navigasi Landing Page (Navbar) */}
      <SiteHeader path="/peta" />

      {/* 2. Halaman Peta Spasial Full Screen (Di bawah navbar, tanpa container kecil) */}
      <main className="flex-1 w-full h-full relative overflow-hidden" data-lenis-prevent="true">
        <WargaSpatialMap
          className="h-full w-full"
          reports={mapReportPoints}
          shelters={mapShelterPoints}
          telemetry={telemetryPoints}
          topRightWidget={floatingTopRight}
          autoExpandPosko={false}
        />
      </main>

      {/* 3. MODAL: Opsi Masuk sebagai Warga untuk Melapor Banjir */}
      {showLaporModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            {/* Tombol Tutup X */}
            <button
              type="button"
              onClick={() => setShowLaporModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Ilustrasi Icon Modal */}
            <div className="w-14 h-14 rounded-2xl bg-[#EEF5F3] text-[#38746D] mx-auto flex items-center justify-center mb-4 shadow-xs">
              <Megaphone className="w-7 h-7" />
            </div>

            {/* Konten Judul & Deskripsi */}
            <h3 className="text-lg sm:text-xl font-bold text-[#132422] mb-2">
              Kirim Laporan Banjir
            </h3>
            <p className="text-xs sm:text-sm text-[#4B635F] leading-relaxed mb-6">
              Untuk menyampaikan laporan genangan, rembesan tanggul, atau kondisi darurat banjir terverifikasi kepada posko BPBD Indramayu, silakan masuk ke akun Warga terlebih dahulu.
            </p>

            {/* Opsi Aksi Modal */}
            <div className="flex flex-col gap-2.5">
              {/* Opsi 1: Masuk sebagai Warga */}
              <Link
                href="/login?role=warga&redirect=/warga/lapor"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#38746D] hover:bg-[#24544E] text-white font-bold text-sm shadow-md shadow-[#38746D]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Masuk sebagai Warga</span>
                <ArrowRight className="w-4 h-4 shrink-0 ml-0.5" />
              </Link>

              {/* Opsi 2: Batal / Cancel */}
              <button
                type="button"
                onClick={() => setShowLaporModal(false)}
                className="w-full py-3 px-5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-all cursor-pointer active:scale-95"
              >
                Batal / Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PANEL CUACA DETAIL & INTERAKTIF (BOTTOM SHEET DI MOBILE / SIDE DRAWER DI DESKTOP) */}
      <WeatherDetailPanel
        isOpen={isWeatherPanelOpen}
        onClose={() => setIsWeatherPanelOpen(false)}
        data={weatherData}
      />
    </div>
  );
}
