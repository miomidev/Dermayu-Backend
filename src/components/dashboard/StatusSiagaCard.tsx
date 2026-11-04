"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Droplets,
  Activity,
  PhoneCall,
} from "lucide-react";
import { ForkedRouteIcon, BeaconAlertIcon } from "@/components/ui/Icons";
import { getActiveSession } from "@/utils/authSession";

export type SiagaLevel = "NORMAL" | "SIAGA_3" | "SIAGA_2" | "SIAGA_1";

interface StatusSiagaCardProps {
  initialLevel?: SiagaLevel;
  className?: string;
}

interface ThemeConfig {
  containerBg: string;
  borderColor: string;
  titleColor: string;
  badgeLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  pulseColor: string;
  debit: string;
  radar: string;
  illustration: "bell_amber" | "bell_rose" | "shield";
}

const SIAGA_CONFIGS: Record<SiagaLevel, ThemeConfig> = {
  NORMAL: {
    containerBg: "bg-[#F4FBF7]",
    borderColor: "border-emerald-200",
    titleColor: "text-emerald-950",
    badgeLabel: "NORMAL (Aman)",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    badgeBorder: "border-emerald-300",
    pulseColor: "bg-emerald-500",
    debit: "120 m³/s",
    radar: "+15 cm",
    illustration: "shield",
  },
  SIAGA_3: {
    containerBg: "bg-[#FFFBF0]",
    borderColor: "border-amber-200",
    titleColor: "text-amber-950",
    badgeLabel: "SIAGA III (Siaga Sungai)",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-900",
    badgeBorder: "border-amber-300",
    pulseColor: "bg-amber-500",
    debit: "220 m³/s",
    radar: "+35 cm",
    illustration: "bell_amber",
  },
  SIAGA_2: {
    containerBg: "bg-[#FFF8F0]",
    borderColor: "border-[#F5D5B8]",
    titleColor: "text-[#3D1A0A]",
    badgeLabel: "SIAGA II (Waspada Rob)",
    badgeBg: "bg-[#FFE8CC]",
    badgeText: "text-[#9A3412]",
    badgeBorder: "border-[#FDBA74]",
    pulseColor: "bg-amber-500",
    debit: "310 m³/s",
    radar: "+65 cm",
    illustration: "bell_amber",
  },
  SIAGA_1: {
    containerBg: "bg-[#FFF1F2]",
    borderColor: "border-rose-300",
    titleColor: "text-rose-950",
    badgeLabel: "SIAGA I (Darurat Banjir)",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-900",
    badgeBorder: "border-rose-300",
    pulseColor: "bg-rose-500",
    debit: "680 m³/s",
    radar: "+145 cm",
    illustration: "bell_rose",
  },
};

/**
 * 3D Ringing Bell Illustration dengan efek getar/soundwave sesuai referensi Gambar 2
 */
function RingingBell3D({ color = "amber" }: { color?: "amber" | "rose" }) {
  const isRose = color === "rose";
  const mainGradStart = isRose ? "#F43F5E" : "#FB923C";
  const mainGradEnd = isRose ? "#BE123C" : "#EA580C";
  const waveColor = isRose ? "#FB7185" : "#A3E635";
  const rimStroke = isRose ? "#881337" : "#7C2D12";
  const handleColor = isRose ? "#9F1239" : "#9A3412";

  return (
    <motion.div
      animate={{ rotate: [-5, 5, -5], y: [-1, 1, -1] }}
      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      className="relative w-15 h-15 sm:w-20 sm:h-20 shrink-0 select-none pointer-events-none flex items-center justify-center"
    >
      <svg viewBox="0 0 84 84" fill="none" className="w-full h-full drop-shadow-sm">
        <defs>
          <linearGradient id={`bellBodyGrad_${color}`} x1="15%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor={mainGradStart} />
            <stop offset="100%" stopColor={mainGradEnd} />
          </linearGradient>
        </defs>

        {/* Soundwaves / Gelombang Suara Bergetar Kiri */}
        <path
          d="M15 28 C11 34 11 46 15 52"
          stroke={waveColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M8 24 C3 33 3 51 8 58"
          stroke={waveColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Soundwaves / Gelombang Suara Bergetar Kanan */}
        <path
          d="M69 28 C73 34 73 46 69 52"
          stroke={waveColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M76 24 C81 33 81 51 76 58"
          stroke={waveColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Partikel Getar Kecil di Bawah */}
        <rect
          x="24"
          y="69"
          width="5.5"
          height="2.8"
          rx="1.4"
          transform="rotate(-28 26.5 70.4)"
          fill={waveColor}
          opacity="0.8"
        />
        <rect
          x="54"
          y="69"
          width="5.5"
          height="2.8"
          rx="1.4"
          transform="rotate(28 56.5 70.4)"
          fill={waveColor}
          opacity="0.8"
        />

        {/* Handle / Gagang Lonceng Atas */}
        <path
          d="M38 13 C38 8.5 46 8.5 46 13"
          stroke={handleColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Bandul / Clapper Lonceng */}
        <ellipse cx="42" cy="59" rx="5.5" ry="4" fill={rimStroke} />

        {/* Badan Lonceng 3D */}
        <path
          d="M35 14 C35 14 49 14 49 14 C51 25 59 39 67 49 C69 52 67 55 62 55 L22 55 C17 55 15 52 17 49 C25 39 33 25 35 14 Z"
          fill={`url(#bellBodyGrad_${color})`}
        />

        {/* Garis Bibir Lonceng Bawah */}
        <path
          d="M19 50.5 C19 50.5 29 54.5 42 54.5 C55 54.5 65 50.5 65 50.5"
          stroke={rimStroke}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Highlight Pantulan Cahaya 3D Putih di Flank Kiri */}
        <path
          d="M28 23 C25 31 22 41 25 49 C23 45 25 33 30 23 Z"
          fill="#FFFFFF"
          opacity="0.65"
        />
        <circle cx="30" cy="21" r="2.8" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </motion.div>
  );
}

/**
 * Perisai Aman 3D untuk Status Normal (Aman)
 */
function ShieldSafeIllustration() {
  return (
    <motion.div
      animate={{ y: [-2, 2, -2], rotate: [-1, 1, -1] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className="relative w-15 h-15 sm:w-20 sm:h-20 shrink-0 select-none pointer-events-none flex items-center justify-center"
    >
      <svg viewBox="0 0 84 84" fill="none" className="w-full h-full drop-shadow-sm">
        <defs>
          {/* Emerald 3D Gradient */}
          <linearGradient id="shieldGrad" x1="20%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="45%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Halo Ring Gradient */}
          <radialGradient id="shieldHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft Background Halo Circle */}
        <circle cx="42" cy="42" r="36" fill="url(#shieldHalo)" />

        {/* Cincin Halus Dekoratif */}
        <circle
          cx="42"
          cy="42"
          r="31"
          stroke="#059669"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.25"
        />

        {/* 3D Shield Base Path */}
        <path
          d="M42 16 C54 16 63 21 63 33 C63 50 49 63 42 67 C35 63 21 50 21 33 C21 21 30 16 42 16 Z"
          fill="url(#shieldGrad)"
        />

        {/* Inner Shield Bevel / Border Halus */}
        <path
          d="M42 19 C51.5 19 59.5 23.5 59.5 33.5 C59.5 47.5 48 58.5 42 62.5 C36 58.5 24.5 47.5 24.5 33.5 C24.5 23.5 32.5 19 42 19 Z"
          stroke="#A7F3D0"
          strokeWidth="1.5"
          opacity="0.5"
          fill="none"
        />

        {/* Specular Highlight Gloss Curve pada Sayap Kiri Perisai */}
        <path
          d="M26 31 C26 23 32 19 40 18 C33 21 28 27 28 36 C28 44 33 50 38 54 C33 51 26 44 26 31 Z"
          fill="#FFFFFF"
          opacity="0.45"
        />

        {/* Bold White Checkmark di Tengah */}
        <path
          d="M33 41 L39 47 L51 35"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Partikel Kilau / Sparkle */}
        <circle cx="63" cy="22" r="2.2" fill="#34D399" opacity="0.9" />
        <circle cx="21" cy="54" r="1.6" fill="#34D399" opacity="0.8" />
      </svg>
    </motion.div>
  );
}

export function StatusSiagaCard({ initialLevel = "NORMAL", className = "" }: StatusSiagaCardProps) {
  const [level, setLevel] = useState<SiagaLevel>(initialLevel);
  const [district, setDistrict] = useState("Kandanghaur");

  useEffect(() => {
    const session = getActiveSession();
    if (session?.district) {
      let cleanDistrict = session.district.split(" - ")[0].trim();
      if (cleanDistrict === "Indramayu") {
        cleanDistrict = "Kandanghaur";
      }
      if (cleanDistrict) {
        setDistrict(cleanDistrict);
      }
    } else {
      setDistrict("Kandanghaur");
    }
  }, []);

  const config = SIAGA_CONFIGS[level];
  const isEmergency = level !== "NORMAL";

  return (
    <section
      className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4 border shadow-xs relative overflow-hidden transition-all duration-300 ${config.containerBg} ${config.borderColor} ${className}`}
    >
      {/* ============================================================ */}
      {/* 1. BAGIAN ATAS: TEKS INFORMASI (KIRI) & ILUSTRASI (KANAN)    */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          {/* Baris 1: Judul Wilayah */}
          <h3 className={`text-xs sm:text-sm font-black tracking-tight leading-snug truncate ${config.titleColor}`}>
            Status Siaga Banjir {district}
          </h3>

          {/* Baris 2: Badge Status Siaga (Tinggi & Ukuran Selaras Tombol Hero, Klik untuk beralih mode preview) */}
          <div>
            <button
              type="button"
              onClick={() => setLevel((prev) => (prev === "NORMAL" ? "SIAGA_2" : "NORMAL"))}
              title="Klik untuk beralih antara status Normal dan Siaga"
              className={`h-8 sm:h-9.5 inline-flex items-center gap-1.5 px-3 sm:px-3.5 rounded-full text-[11px] sm:text-xs font-black border shadow-2xs cursor-pointer active:scale-95 transition-all select-none ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${config.pulseColor} animate-pulse shrink-0`} />
              <span>{config.badgeLabel}</span>
            </button>
          </div>

          {/* Baris 3: Metrik Telemetri (Wajib 1 Baris) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-[11.5px] text-slate-600 whitespace-nowrap overflow-hidden">
            <span className="inline-flex items-center gap-1 shrink-0 font-medium">
              <Droplets className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
              <span>
                Debit Rentang: <strong className="text-slate-900 font-bold">{config.debit}</strong>
              </span>
            </span>
            <span className="text-slate-300 shrink-0">•</span>
            <span className="inline-flex items-center gap-1 shrink-0 font-medium">
              <Activity className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
              <span>
                Radar Muara: <strong className="text-slate-900 font-bold">{config.radar}</strong>
              </span>
            </span>
          </div>
        </div>

        {/* Ilustrasi Status 3D (Kanan Atas) */}
        <div className="shrink-0 flex items-center justify-center pl-1">
          {config.illustration === "bell_amber" && <RingingBell3D color="amber" />}
          {config.illustration === "bell_rose" && <RingingBell3D color="rose" />}
          {config.illustration === "shield" && <ShieldSafeIllustration />}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. BAGIAN BAWAH: TOMBOL AKSI BERDAMPINGAN (1 BARIS PENUH)    */}
      {/* ============================================================ */}
      <div className="pt-2.5 sm:pt-3">
        {isEmergency ? (
          <div className="flex items-center gap-2 w-full">
            {/* Tombol Utama: Rute Posko Terdekat (Tinggi h-9.5, Font-black, Ikon Rute Navbar) */}
            <Link
              href="/warga/posko"
              replace
              scroll={false}
              className="h-9.5 flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 rounded-full bg-[#1D443F] hover:bg-[#153430] text-white text-[11px] sm:text-xs font-black shadow-md active:scale-95 transition-all truncate"
            >
              <ForkedRouteIcon className="w-4 h-4 text-white shrink-0" />
              <span className="truncate">Rute Posko Terdekat</span>
            </Link>

            {/* Tombol Sekunder: Panggilan Darurat 112 (Tinggi h-9.5, Font-black) */}
            <a
              href="tel:112"
              className="h-9.5 flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-black shadow-md active:scale-95 transition-all truncate"
            >
              <PhoneCall className="w-4 h-4 text-white shrink-0" />
              <span className="truncate">Panggilan Darurat 112</span>
            </a>
          </div>
        ) : (
          <div className="w-full">
            {/* Tombol Status Normal: Pantau Laporan Banjir (Ikon Lapor BeaconAlertIcon di Kiri & Tanpa Panah Kanan) */}
            <Link
              href="/warga/aduan"
              replace
              scroll={false}
              className="h-9.5 w-full inline-flex items-center justify-center gap-1.5 px-4 rounded-full bg-[#1D443F] hover:bg-[#153430] text-white text-[11px] sm:text-xs font-black shadow-md active:scale-95 transition-all"
            >
              <BeaconAlertIcon className="w-4 h-4 text-white shrink-0" />
              <span>Pantau Laporan Banjir</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
