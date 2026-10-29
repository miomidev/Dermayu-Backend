"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { MapPin, Activity, Search } from "lucide-react";
import { INDRAMAYU_MAP_PATH } from "@/data/indramayuContour";

type PinSize = "lg" | "md" | "sm";

interface PinData {
  id: string;
  name: string;
  locationKey: string;
  metric: string;
  status: string;
  statusFilter: string;
  gridX: number; // Koordinat SVG X tepat pada grid heksagon peta
  gridY: number; // Koordinat SVG Y tepat pada grid heksagon peta
  left: string;  // Persentase posisi relatif terhadap canvas peta
  top: string;   // Persentase posisi relatif terhadap canvas peta
  imageUrl: string;
  size: PinSize;
  sizeClass: string;
  delay: number;
  expandDirection?: "left" | "right";
}

const PINS: PinData[] = [
  {
    id: "losarang",
    name: "Pantura Losarang / Jalur Utama",
    locationKey: "Losarang",
    metric: "Genangan Jalur Utama",
    status: "Siaga 3",
    statusFilter: "Siaga 3",
    gridX: 244,
    gridY: 228,
    left: "40.78%",
    top: "49.57%",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbQsC3BVOVi5zm99lVgMPBJMmnoXN0-zP1UX31O1NyfA&s=10",
    size: "lg",
    sizeClass: "w-20 h-20 sm:w-22 sm:h-22",
    delay: 0,
    expandDirection: "right",
  },
  {
    id: "eretan",
    name: "Eretan (Pesisir Barat)",
    locationKey: "Eretan",
    metric: "Pasang Rob Pesisir",
    status: "Waspada Rob",
    statusFilter: "Waspada Rob",
    gridX: 136,
    gridY: 165,
    left: "23.02%",
    top: "36.30%",
    imageUrl:
      "https://asset.kompas.com/crops/H_AWwIamiXSZ-B0NPKKqu3gQL7A=/0x0:0x0/1200x800/data/photo/2025/12/04/693127f69960a.jpeg",
    size: "md",
    sizeClass: "w-14 h-14 sm:w-16 sm:h-16",
    delay: 0.3,
    expandDirection: "right",
  },
  {
    id: "cantigi",
    name: "Muara Cantigi / Pasekan",
    locationKey: "Cantigi",
    metric: "Luapan Muara Pesisir",
    status: "Waspada Rob",
    statusFilter: "Waspada Rob",
    gridX: 324,
    gridY: 116,
    left: "53.97%",
    top: "25.10%",
    imageUrl:
      "https://min.co.id/wp-content/uploads/2021/02/sasa6002.jpg",
    size: "md",
    sizeClass: "w-14 h-14 sm:w-16 sm:h-16",
    delay: 0.6,
    expandDirection: "right",
  },
  {
    id: "cimanuk",
    name: "DAS Cimanuk / Pemukiman",
    locationKey: "Sindang",
    metric: "Aliran Tanggul Hilir",
    status: "Siaga 2",
    statusFilter: "Siaga 2",
    gridX: 384,
    gridY: 305,
    left: "63.86%",
    top: "66.90%",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMiQxq6ShDaxt7T5r3h5O_1dskvv2eqdf4ldhn_kSrWI6Q_sGRgJCmc1t7&s=10",
    size: "sm",
    sizeClass: "w-12 h-12 sm:w-13 sm:h-13",
    delay: 0.9,
    expandDirection: "left",
  },
];

// Helper kalkulasi titik segi enam mini (Mini Hexagon Points) pada grid SVG (cx, cy)
function getGridHexPolygon(cx: number, cy: number, r: number = 3.5): string {
  const dx = +(r * (3 / 3.5)).toFixed(2);
  const dy = +(r / 2).toFixed(2);
  return `${cx},${+(cy - r).toFixed(2)} ${+(cx + dx).toFixed(2)},${+(cy - dy).toFixed(2)} ${+(cx + dx).toFixed(2)},${+(cy + dy).toFixed(2)} ${cx},${+(cy + r).toFixed(2)} ${+(cx - dx).toFixed(2)},${+(cy + dy).toFixed(2)} ${+(cx - dx).toFixed(2)},${+(cy - dy).toFixed(2)}`;
}

// 6 Tetangga heksagon presisi sarang lebah yang mengelilingi titik pusat pada grid peta asli
function getGridNeighbors(cx: number, cy: number): [number, number][] {
  return [
    [cx - 8, cy],
    [cx + 8, cy],
    [cx - 4, cy - 7],
    [cx + 4, cy - 7],
    [cx - 4, cy + 7],
    [cx + 4, cy + 7],
  ];
}

interface ExpandingPinMarkerProps {
  pin: PinData;
  index: number;
  isSelected: boolean;
  isInView: boolean;
  onSelect: (pin: PinData) => void;
}

function ExpandingPinMarker({
  pin,
  index,
  isSelected,
  isInView,
  onSelect,
}: ExpandingPinMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isExpandLeft = pin.expandDirection === "left";

  const tailStyles = {
    lg: "border-l-[16px] border-r-[16px] border-t-[16px] -mt-1.5",
    md: "border-l-[10px] border-r-[10px] border-t-[10px] -mt-1",
    sm: "border-l-[8px] border-r-[8px] border-t-[8px] -mt-1",
  }[pin.size];

  return (
    <motion.div
      style={{
        left: pin.left,
        top: pin.top,
        transformOrigin: "bottom center",
        zIndex: isHovered ? 50 : isSelected ? 30 : 20,
      }}
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={
        isInView
          ? {
              scale: 1,
              opacity: 1,
              rotate: [0, 4, -2, 0], // Ayunan inersia saat peta bergeser ke kiri
              transition: {
                scale: {
                  type: "spring" as const,
                  stiffness: 260,
                  damping: 18,
                  delay: 0.2 + index * 0.15,
                },
                opacity: {
                  duration: 0.2,
                  delay: 0.2 + index * 0.15,
                },
                rotate: {
                  delay: 1.1 + index * 0.05,
                  duration: 0.8,
                  ease: "easeInOut" as const,
                },
              },
            }
          : { scale: 0, opacity: 0, rotate: 0 }
      }
      className="absolute -translate-x-1/2 -translate-y-full cursor-pointer select-none"
      onClick={() => onSelect(pin)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Idle Floating Halus (Continuous Motion Naik-Turun, Jeda saat Hover) */}
      <motion.div
        animate={
          isInView && !isHovered
            ? { y: [-3, 3, -3] }
            : { y: isHovered ? -3 : 0 }
        }
        transition={{
          duration: 3.5 + index * 0.4,
          repeat: isHovered ? 0 : Infinity,
          ease: "easeInOut" as const,
          delay: 2.0 + index * 0.1,
        }}
        className="relative flex flex-col items-center"
      >
        {/* Anchor Container yang Mempertahankan Ukuran & Posisi Ekor Segitiga */}
        <div className="relative">
          {/* Expanding Capsule Pill Container */}
          <div
            className={`absolute top-0 ${
              isExpandLeft ? "right-0 flex-row-reverse" : "left-0 flex-row"
            } h-full min-w-full w-max flex items-center bg-[#1D443F] border-[2.5px] border-[#38746D] rounded-full shadow-xl overflow-hidden transition-all duration-200 z-10 ${
              isSelected
                ? "ring-4 ring-[#38746D]/35 shadow-[0_0_16px_rgba(56,116,109,0.4)]"
                : isHovered
                ? "shadow-2xl shadow-teal-950/60"
                : ""
            }`}
          >
            {/* 1. Lingkaran Foto Pin (Selalu Anchor di Ujung Kiri / Kanan) */}
            <div className="h-full aspect-square shrink-0 rounded-full overflow-hidden bg-white flex items-center justify-center">
              <img
                src={pin.imageUrl}
                alt={pin.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* 2. Keterangan Teks yang Terbuka ke Samping Saat Hover */}
            <motion.div
              initial={false}
              animate={{
                width: isHovered ? "auto" : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{
                width: { type: "spring", stiffness: 350, damping: 28 },
                opacity: { duration: 0.22, delay: isHovered ? 0.08 : 0 },
              }}
              className="overflow-hidden whitespace-nowrap"
              style={{ pointerEvents: isHovered ? "auto" : "none" }}
            >
              <motion.div
                initial={false}
                animate={{
                  x: isHovered ? 0 : isExpandLeft ? 15 : -15,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`py-1.5 ${
                  isExpandLeft ? "pl-4 pr-2.5 text-right" : "pl-2.5 pr-4 text-left"
                }`}
              >
                <p className="text-xs font-bold text-white tracking-wide leading-tight">
                  {pin.name}
                </p>
                <p className="text-[11px] text-[#A4C6C1] font-medium mt-0.5 leading-tight">
                  {pin.metric}
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Dummy Circle Sizing Placeholder (Menjaga Dimensi Parent & Posisi Ekor Tetap Presisi) */}
          <div className={`${pin.sizeClass} pointer-events-none opacity-0`} />
        </div>

        {/* Ekor Segitiga Penunjuk di Bawah Foto (Z-Index di Belakang Kapsul) */}
        <div
          className={`relative z-0 w-0 h-0 border-l-transparent border-r-transparent border-t-[#38746D] drop-shadow-xs pointer-events-none ${tailStyles}`}
        />
      </motion.div>
    </motion.div>
  );
}

export function ShowcaseBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.2 });

  const [selectedLocation, setSelectedLocation] = useState("Semua Wilayah");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [activePin, setActivePin] = useState<string>("losarang");

  const handleSelectLocation = (loc: string) => {
    setSelectedLocation(loc);
    const matched = PINS.find((p) => p.locationKey === loc);
    if (matched) {
      setActivePin(matched.id);
      setSelectedStatus(matched.statusFilter);
    }
  };

  const handlePinClick = (pin: PinData) => {
    setActivePin(pin.id);
    setSelectedLocation(pin.locationKey);
    setSelectedStatus(pin.statusFilter);
  };

  return (
    <section
      ref={sectionRef}
      id="tentang"
      aria-label="Pantauan Wilayah Real-Time"
      className="relative w-full bg-white pt-20 pb-16 md:pt-28 md:pb-24 scroll-mt-20 overflow-x-clip overflow-y-visible border-t border-[#E8F1EE]"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Open 2-Column Split Sesuai Desain Campty (Tanpa Kotak Kartu Bertingkat) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Kolom Kiri: Peta Mini-Hexagon Indramayu (Animasi 2 Fase Terkoordinasi) */}
          <div className="lg:col-span-6 relative z-10 w-full flex items-center justify-center select-none overflow-visible">
            <motion.div
              className="relative w-full lg:w-[130%] -ml-0 lg:-ml-16 pointer-events-auto origin-center overflow-visible"
              initial={{ x: "42%", scale: 1.52, opacity: 0 }}
              animate={
                isInView
                  ? {
                      x: 0,
                      scale: 1.05,
                      opacity: 1,
                      transition: {
                        opacity: { duration: 0.4 },
                        x: { duration: 1.25, delay: 0.9, ease: [0.16, 1, 0.3, 1] as const },
                        scale: { duration: 1.25, delay: 0.9, ease: [0.16, 1, 0.3, 1] as const },
                      },
                    }
                  : {
                      x: "42%",
                      scale: 1.52,
                      opacity: 0,
                      transition: { duration: 0.2 },
                    }
              }
            >
              <div className="relative w-full max-w-[560px] lg:max-w-none aspect-[4/3] flex items-center justify-center mx-auto overflow-visible">
                
                {/* Siluet Dotted Hexagonal Map Murni Melayang Bebas */}
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 600 450"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full max-h-[430px] overflow-visible"
                  >
                    <defs>
                      {/* Pola Mini-Hexagon Terhuyung / Staggered (Pale Mint #C7DBD7) */}
                      <pattern id="hex-dot-matrix" width="8" height="14" patternUnits="userSpaceOnUse">
                        {/* Baris 1: Hexagon pusat */}
                        <polygon
                          points="4,0.5 7,2.25 7,5.75 4,7.5 1,5.75 1,2.25"
                          fill="#C7DBD7"
                          fillOpacity="0.75"
                        />
                        {/* Baris 2: Hexagon berselang-seling (staggered) di tepi kiri & kanan */}
                        <polygon
                          points="0,7.5 3,9.25 3,12.75 0,14.5 -3,12.75 -3,9.25"
                          fill="#C7DBD7"
                          fillOpacity="0.75"
                        />
                        <polygon
                          points="8,7.5 11,9.25 11,12.75 8,14.5 5,12.75 5,9.25"
                          fill="#C7DBD7"
                          fillOpacity="0.75"
                        />
                      </pattern>

                      {/* Clip-Path Batas Administratif Resmi Kabupaten Indramayu */}
                      <clipPath id="indramayu-clip">
                        <path d={INDRAMAYU_MAP_PATH} />
                      </clipPath>
                    </defs>

                    {/* 1. Siluet Dotted Hexagonal Map Murni Melayang Bebas */}
                    <rect
                      width="100%"
                      height="100%"
                      fill="url(#hex-dot-matrix)"
                      clipPath="url(#indramayu-clip)"
                    />

                    {/* 2. Cluster 7 Titik Heksagon Merah Presisi 100% pada Grid SVG Peta Asli */}
                    <g className="map-hex-clusters pointer-events-none">
                      {PINS.map((pin) => {
                        const cx = (parseFloat(pin.left) / 100) * 600;
                        const cy = (parseFloat(pin.top) / 100) * 450;
                        const neighbors = getGridNeighbors(cx, cy);
                        return (
                          <motion.g
                            key={`hex-${pin.id}`}
                            animate={{ opacity: [0.85, 1, 0.85] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" as const }}
                          >
                            {/* Soft Ambient Halo Aura di sekeliling cluster heksagon */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={14}
                              fill="#FEE2E2"
                              fillOpacity={0.4}
                            />

                            {/* 6 Titik Tetangga Heksagon Persis di Grid Sekitarnya: Merah Muda Transparan */}
                            {neighbors.map(([nx, ny], idx) => (
                              <polygon
                                key={`neighbor-${idx}`}
                                points={getGridHexPolygon(nx, ny)}
                                fill="#EF4444"
                                fillOpacity={0.35}
                              />
                            ))}

                            {/* 1 Titik Pusat Heksagon Tepat di Bawah Jarum Pin: Merah Pekat Solid */}
                            <polygon
                              points={getGridHexPolygon(cx, cy)}
                              fill="#EF4444"
                              fillOpacity={1}
                            />
                          </motion.g>
                        );
                      })}
                    </g>
                  </svg>
                </div>

                {/* Pin Markers Terpadu dengan Interaksi Expanding Pill Organik saat Hover */}
                {PINS.map((pin, index) => (
                  <ExpandingPinMarker
                    key={pin.id}
                    pin={pin}
                    index={index}
                    isSelected={activePin === pin.id}
                    isInView={isInView}
                    onSelect={handlePinClick}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Kolom Kanan: Teks Konten & Filter Box Masuk Bertahap Terkoordinasi */}
          <div className="lg:col-span-6 relative z-20 text-left flex flex-col justify-center space-y-6">
            {/* 1. Judul: Mulai meluncur bertepatan saat peta bergeser ke kiri (delay: 1.0s) */}
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#132422] leading-[1.2]"
              initial={{ opacity: 0, x: 60 }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.7, delay: 1.0, ease: [0.16, 1, 0.3, 1] as const },
                    }
                  : {
                      opacity: 0,
                      x: 60,
                      transition: { duration: 0.2 },
                    }
              }
            >
              Pantauan Real–Time Sungai Cimanuk &amp; Wilayah Pesisir
            </motion.h2>

            {/* 2. Deskripsi: Menyusul cepat sebelum judul selesai (delay: 1.15s) */}
            <motion.p
              className="text-sm sm:text-base text-[#4B635F] leading-relaxed max-w-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.7, delay: 1.15, ease: [0.16, 1, 0.3, 1] as const },
                    }
                  : {
                      opacity: 0,
                      x: 50,
                      transition: { duration: 0.2 },
                    }
              }
            >
              Telusuri data ketinggian muka air dari hulu Bendung Rentang hingga hilir muara secara akurat dari perangkat Anda.
            </motion.p>

            {/* 3. Panel Filter Search: Menyusul terakhir dengan transisi halus (delay: 1.3s) */}
            <motion.div
              className="pt-1 sm:pt-2"
              initial={{ opacity: 0, x: 40, y: 15 }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      x: 0,
                      y: 0,
                      pointerEvents: "auto",
                      transition: { duration: 0.7, delay: 1.3, ease: [0.16, 1, 0.3, 1] as const },
                    }
                  : {
                      opacity: 0,
                      x: 40,
                      y: 15,
                      pointerEvents: "none",
                      transition: { duration: 0.2 },
                    }
              }
            >
              {/* Search / Filter Control Card Berbentuk Pill Bersih Sesuai Palet Pale Mint */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 p-2 rounded-2xl sm:rounded-full bg-[#EEF5F3] border border-[#D5E4E0] shadow-2xs">
                {/* Location Filter */}
                <div className="flex-1 min-w-[140px] flex items-center gap-2.5 px-3 sm:px-4 py-1.5">
                  <MapPin className="h-4 w-4 text-[#38746D] shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] font-semibold text-[#4B635F] uppercase tracking-wider">Lokasi</p>
                    <select
                      value={selectedLocation}
                      onChange={(e) => handleSelectLocation(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm font-bold text-[#132422] focus:outline-none cursor-pointer"
                    >
                      <option value="Semua Wilayah">Semua Wilayah</option>
                      <option value="Losarang">Losarang (Jalur Utama)</option>
                      <option value="Eretan">Eretan (Pesisir Barat)</option>
                      <option value="Cantigi">Cantigi (Muara Pesisir)</option>
                      <option value="Sindang">Sindang (DAS Cimanuk)</option>
                    </select>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex-1 min-w-[140px] flex items-center gap-2.5 px-3 sm:px-4 py-1.5 border-l border-[#D5E4E0]">
                  <Activity className="h-4 w-4 text-[#38746D] shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] font-semibold text-[#4B635F] uppercase tracking-wider">Status Siaga</p>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm font-bold text-[#132422] focus:outline-none cursor-pointer"
                    >
                      <option value="Semua Status">Semua Status</option>
                      <option value="Normal">Normal</option>
                      <option value="Waspada Rob">Waspada Rob</option>
                      <option value="Siaga 2">Siaga 2 (Kritis)</option>
                      <option value="Siaga 3">Siaga 3 (Waspada)</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="button"
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#38746D] text-white hover:bg-[#24544E] active:scale-95 transition-all shadow-xs shrink-0 ml-auto cursor-pointer"
                  aria-label="Filter Wilayah"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
