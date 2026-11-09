"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Droplets,
  Wind,
  Sun,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  Cloud,
  CloudLightning,
  Activity,
  Gauge,
  Sunrise,
  Sunset,
  AlertTriangle,
  Info,
  ShieldCheck,
} from "lucide-react";

export interface HourlyForecastItem {
  time: string;
  temp: number;
  weatherCode: number;
  pop?: number; // Persentase kemungkinan hujan (%)
}

export interface DailyForecastItem {
  day: string;
  kondisi: string;
  weatherCode: number;
  pop: number; // Persentase kemungkinan hujan (%)
  tempMin: number;
  tempMax: number;
}

export interface WeatherMetrics {
  curahHujan: { value: string; pop: string; note: string };
  angin: { speed: string; direction: string; note: string };
  kelembaban: { value: string; note: string };
  uvIndex: { value: number; label: string; note: string };
  kualitasUdara?: { aqi: number; label: string; note: string };
  matahari?: { terbit: string; terbenam: string };
}

export interface DetailedWeatherData {
  lokasi: string;
  suhu: number;
  suhuMax: number;
  suhuMin: number;
  kondisiSekarang: string;
  weatherCode: number;
  peringatanHujan?: {
    judul: string;
    deskripsi: string;
    level: "warning" | "info" | "safe";
  } | null;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  metrics: WeatherMetrics;
  lastUpdated?: string;
}

interface WeatherDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data?: DetailedWeatherData | null;
}

// Helper ikon cuaca Lucide profesional berdasarkan weather code Open-Meteo
export function getWeatherIcon(code: number, className: string = "w-5 h-5") {
  switch (code) {
    case 0:
      return <Sun className={`${className} text-amber-500`} />;
    case 1:
    case 2:
      return <CloudSun className={`${className} text-amber-500`} />;
    case 3:
      return <Cloud className={`${className} text-slate-500`} />;
    case 45:
    case 48:
      return <Cloud className={`${className} text-slate-400`} />;
    case 51:
    case 53:
    case 55:
      return <CloudDrizzle className={`${className} text-sky-400`} />;
    case 61:
    case 63:
      return <CloudRain className={`${className} text-sky-500`} />;
    case 65:
    case 80:
    case 81:
    case 82:
      return <CloudRain className={`${className} text-blue-600`} />;
    case 95:
    case 96:
    case 99:
      return <CloudLightning className={`${className} text-purple-600`} />;
    default:
      return <CloudSun className={`${className} text-amber-500`} />;
  }
}

// Data default realistis untuk Kabupaten Indramayu (sinkronisasi BMKG & Open-Meteo)
export const DEFAULT_DETAILED_WEATHER: DetailedWeatherData = {
  lokasi: "Kabupaten Indramayu",
  suhu: 28,
  suhuMax: 35,
  suhuMin: 25,
  kondisiSekarang: "Berawan",
  weatherCode: 2,
  peringatanHujan: {
    judul: "Kemungkinan Hujan Sangat Tinggi",
    deskripsi:
      "Kemungkinan hujan dalam satu jam ke depan adalah 100%. Bersiaplah untuk hujan dan rencanakan perjalanan Anda berdasarkan kondisi aktual.",
    level: "warning",
  },
  hourly: [
    { time: "Sekarang", temp: 28, weatherCode: 2, pop: 100 },
    { time: "08:00", temp: 30, weatherCode: 2, pop: 85 },
    { time: "09:00", temp: 32, weatherCode: 3, pop: 60 },
    { time: "10:00", temp: 34, weatherCode: 3, pop: 40 },
    { time: "11:00", temp: 35, weatherCode: 1, pop: 20 },
    { time: "12:00", temp: 35, weatherCode: 1, pop: 10 },
    { time: "13:00", temp: 34, weatherCode: 2, pop: 15 },
    { time: "14:00", temp: 33, weatherCode: 2, pop: 25 },
    { time: "15:00", temp: 31, weatherCode: 61, pop: 70 },
    { time: "16:00", temp: 29, weatherCode: 61, pop: 85 },
    { time: "17:00", temp: 28, weatherCode: 63, pop: 90 },
    { time: "18:00", temp: 27, weatherCode: 3, pop: 50 },
    { time: "19:00", temp: 27, weatherCode: 2, pop: 30 },
    { time: "20:00", temp: 26, weatherCode: 2, pop: 10 },
    { time: "21:00", temp: 26, weatherCode: 1, pop: 5 },
    { time: "22:00", temp: 25, weatherCode: 0, pop: 0 },
  ],
  daily: [
    { day: "Hari ini", kondisi: "Berawan", weatherCode: 2, pop: 100, tempMin: 25, tempMax: 36 },
    { day: "Besok", kondisi: "Gerimis", weatherCode: 51, pop: 100, tempMin: 25, tempMax: 35 },
    { day: "Lusa", kondisi: "Gerimis", weatherCode: 51, pop: 55, tempMin: 26, tempMax: 34 },
    { day: "Rabu", kondisi: "Gerimis", weatherCode: 53, pop: 70, tempMin: 26, tempMax: 35 },
    { day: "Kamis", kondisi: "Gerimis", weatherCode: 51, pop: 81, tempMin: 26, tempMax: 35 },
    { day: "Jumat", kondisi: "Hujan Ringan", weatherCode: 61, pop: 100, tempMin: 26, tempMax: 34 },
    { day: "Sabtu", kondisi: "Gerimis", weatherCode: 51, pop: 100, tempMin: 26, tempMax: 34 },
  ],
  metrics: {
    curahHujan: {
      value: "4,6 mm",
      pop: "100%",
      note: "Hujan ringan, tidak ada dampak signifikan ke debit DAS Cimanuk",
    },
    angin: {
      speed: "7,5 km/h",
      direction: "Barat Daya (SW)",
      note: "Kecepatan stabil, cocok dan aman untuk aktivitas melaut",
    },
    kelembaban: {
      value: "76%",
      note: "Lebih lembap dari biasanya (titik embun 24°C)",
    },
    uvIndex: {
      value: 2,
      label: "Terlemah",
      note: "Tidak perlu perlindungan khusus saat beraktivitas luar",
    },
    kualitasUdara: {
      aqi: 147,
      label: "Polusi Ringan",
      note: "Kelompok sensitif disarankan membatasi aktivitas fisik intens",
    },
    matahari: {
      terbit: "05.19 WIB",
      terbenam: "17.41 WIB",
    },
  },
  lastUpdated: "Hari ini 07.50 WIB",
};

export function WeatherDetailPanel({ isOpen, onClose, data }: WeatherDetailPanelProps) {
  const weather = data || DEFAULT_DETAILED_WEATHER;

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Kunci scroll body saat panel terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const mainIcon = useMemo(() => {
    return getWeatherIcon(weather.weatherCode, "w-10 h-10");
  }, [weather.weatherCode]);

  // Konten UI Cuaca yang Elegan & Komprehensif
  const panelContent = (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-4 space-y-4 sm:space-y-5 text-slate-800 select-none">
      {/* 1. OVERVIEW HEADER */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs sm:text-sm font-semibold">
            <MapPin className="w-4 h-4 text-[#38746D] shrink-0" />
            <span className="truncate">{weather.lokasi}</span>
          </div>
          {/* Suhu Utama (Font Raksasa ala Modern Weather App) */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-6xl sm:text-7xl font-extralight tracking-tighter text-slate-900 leading-none">
              {Math.round(weather.suhu)}°
            </span>
            <div className="text-slate-500 text-xs sm:text-sm font-medium">
              <div>{weather.kondisiSekarang}</div>
              <div className="text-slate-400 text-xs">
                {weather.suhuMin}° / {weather.suhuMax}°
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Tutup X */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 sm:p-2.5 rounded-full bg-slate-200/80 hover:bg-slate-300 active:scale-95 text-slate-700 transition cursor-pointer shrink-0 shadow-xs"
          title="Tutup Panel Cuaca"
          aria-label="Tutup Panel Cuaca"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. CARD PERINGATAN DINI (CONDITIONAL / PROMINENT) */}
      {weather.peringatanHujan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-50/80 border border-sky-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-4.5 shadow-sm text-slate-800"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/15 text-sky-700 flex items-center justify-center shrink-0">
              <CloudRain className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {weather.peringatanHujan.judul}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {weather.peringatanHujan.deskripsi}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. CARD 24 JAM BERIKUTNYA (HORIZONTAL SCROLL) */}
      <div className="bg-white/90 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>24 Jam Berikutnya</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-1.5 pt-0.5">
          {weather.hourly.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-1.5 shrink-0 min-w-[50px] text-center"
            >
              <span className="text-[11px] font-semibold text-slate-500">{item.time}</span>
              <div className="my-0.5 flex flex-col items-center justify-center h-8">
                {getWeatherIcon(item.weatherCode, "w-6 h-6")}
                {item.pop !== undefined && item.pop > 0 && (
                  <span className="text-[9px] font-extrabold text-sky-600 mt-0.5">
                    {item.pop}%
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-slate-800">{Math.round(item.temp)}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CARD 7 HARI BERIKUTNYA (VERTICAL LIST DENGAN RENTANG SUHU) */}
      <div className="bg-white/90 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>7 Hari Berikutnya</span>
        </div>
        <div className="divide-y divide-slate-100">
          {weather.daily.map((dayItem, idx) => (
            <div
              key={idx}
              className="py-2.5 flex items-center justify-between text-xs sm:text-sm"
            >
              {/* Nama Hari */}
              <div className="w-16 sm:w-20 font-semibold text-slate-800 text-xs sm:text-sm shrink-0">
                {dayItem.day}
              </div>

              {/* Ikon Cuaca & Peluang Hujan */}
              <div className="flex items-center gap-1.5 shrink-0 w-14 justify-start">
                {getWeatherIcon(dayItem.weatherCode, "w-4 h-4 sm:w-5 sm:h-5")}
                {dayItem.pop > 0 ? (
                  <span className="text-[10px] font-extrabold text-sky-600">
                    {dayItem.pop}%
                  </span>
                ) : (
                  <span className="w-3" />
                )}
              </div>

              {/* Bar Rentang Suhu: Min Temp - Gradient Bar - Max Temp Simetris */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-slate-400 font-medium text-xs w-6 text-right">
                  {dayItem.tempMin}°
                </span>
                <div className="h-1.5 w-16 bg-gradient-to-r from-blue-400 to-amber-500 rounded-full opacity-80" />
                <span className="text-slate-800 font-bold text-xs w-6 text-left">
                  {dayItem.tempMax}°
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. GRID METRIK (2 KOLOM: CURAH HUJAN, ANGIN, KUALITAS UDARA, UV, KELEMBABAN, MATAHARI) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Metric 1: Curah Hujan */}
        <div className="bg-white/90 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>Curah Hujan</span>
          </div>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {weather.metrics.curahHujan.value}
            </div>
            <div className="text-[11px] font-bold text-sky-700 mt-0.5">
              Peluang: {weather.metrics.curahHujan.pop}
            </div>
          </div>
          <p className="text-[10.5px] text-slate-500 leading-snug mt-1">
            {weather.metrics.curahHujan.note}
          </p>
        </div>

        {/* Metric 2: Kecepatan & Arah Angin */}
        <div className="bg-white/90 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>Kekuatan Angin</span>
          </div>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {weather.metrics.angin.speed}
            </div>
            <div className="text-[11px] font-bold text-teal-700 mt-0.5 truncate">
              {weather.metrics.angin.direction}
            </div>
          </div>
          <p className="text-[10.5px] text-slate-500 leading-snug mt-1">
            {weather.metrics.angin.note}
          </p>
        </div>

        {/* Metric 3: Kualitas Udara (AQI) */}
        {weather.metrics.kualitasUdara && (
          <div className="bg-white/90 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <span>Kualitas Udara</span>
            </div>
            <div className="my-1">
              <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {weather.metrics.kualitasUdara.aqi}
              </div>
              <div className="text-[11px] font-bold text-amber-700 mt-0.5">
                {weather.metrics.kualitasUdara.label}
              </div>
            </div>
            <p className="text-[10.5px] text-slate-500 leading-snug mt-1">
              {weather.metrics.kualitasUdara.note}
            </p>
          </div>
        )}

        {/* Metric 4: Indeks UV */}
        <div className="bg-white/90 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Indeks UV</span>
          </div>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {weather.metrics.uvIndex.value}
            </div>
            <div className="text-[11px] font-bold text-slate-700 mt-0.5">
              {weather.metrics.uvIndex.label}
            </div>
          </div>
          <p className="text-[10.5px] text-slate-500 leading-snug mt-1">
            {weather.metrics.uvIndex.note}
          </p>
        </div>

        {/* Metric 5: Kelembaban */}
        <div className="bg-white/90 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Gauge className="w-3.5 h-3.5 text-sky-600" />
            <span>Kelembaban</span>
          </div>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {weather.metrics.kelembaban.value}
            </div>
          </div>
          <p className="text-[10.5px] text-slate-500 leading-snug mt-1">
            {weather.metrics.kelembaban.note}
          </p>
        </div>

        {/* Metric 6: Siklus Surya */}
        {weather.metrics.matahari && (
          <div className="bg-white/90 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Sunrise className="w-3.5 h-3.5 text-amber-500" />
              <span>Siklus Surya</span>
            </div>
            <div className="my-1.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Sunrise className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{weather.metrics.matahari.terbit}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Sunset className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{weather.metrics.matahari.terbenam}</span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-500 leading-snug mt-1">
              Zona Waktu Indonesia Barat (WIB)
            </p>
          </div>
        )}
      </div>

      {/* Footer Info Sumber */}
      <div className="pt-2 pb-4 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Sinkronisasi Otomatis Terpadu • Indramayu Smart Flood System</span>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Gelap dengan Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[1100] bg-slate-900/40 backdrop-blur-xs pointer-events-auto cursor-pointer"
            aria-label="Tutup Panel Cuaca"
          />

          {/* 1. DESKTOP LAYOUT: SIDE DRAWER DI SISI KANAN */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="hidden md:flex flex-col fixed top-0 right-0 bottom-0 z-[1101] w-[420px] max-w-[90vw] bg-slate-50/95 backdrop-blur-xl border-l border-slate-200/90 shadow-2xl pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Detail Prakiraan Cuaca Indramayu"
          >
            {panelContent}
          </motion.aside>

          {/* 2. MOBILE LAYOUT: SWIPEABLE BOTTOM SHEET DENGAN HANDLE BAR */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              // Jika ditarik ke bawah lebih dari 90px atau kecepatan swipe tinggi, tutup panel
              if (info.offset.y > 90 || info.velocity.y > 450) {
                onClose();
              }
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="md:hidden flex flex-col fixed inset-x-0 bottom-0 z-[1101] max-h-[88vh] bg-slate-50/98 backdrop-blur-xl border-t border-slate-200/90 shadow-2xl rounded-t-[32px] pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Detail Prakiraan Cuaca Indramayu"
          >
            {/* Handle Bar Swipe */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto my-3 shrink-0 cursor-grab active:cursor-grabbing" />
            {panelContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

