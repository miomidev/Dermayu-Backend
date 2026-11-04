"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Navigation,
  Building2,
  AlertTriangle,
  PhoneCall,
  ChevronUp,
  MapPin,
  Compass,
  CheckCircle2,
  Users,
  Droplets,
  Activity,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Share2,
  Package,
} from "lucide-react";
import type {
  MapShelterPoint,
  MapReportPoint,
  MapTelemetryPoint,
} from "@/components/dashboard/WargaSpatialMap";

export interface EvakuasiBottomSheetProps {
  shelters: MapShelterPoint[];
  reports: MapReportPoint[];
  telemetry: MapTelemetryPoint[];
  onSelectShelter?: (shelter: MapShelterPoint) => void;
  onSelectReport?: (report: MapReportPoint) => void;
  onOpenReportModal?: () => void;
  onOpenContactsModal?: () => void;
}

export function EvakuasiBottomSheet({
  shelters = [],
  reports = [],
  telemetry = [],
  onSelectShelter,
  onSelectReport,
  onOpenReportModal,
  onOpenContactsModal,
}: EvakuasiBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"rute" | "posko" | "pantau">("rute");

  // Rute Evakuasi Darurat Terverifikasi
  const evacuationRoutes = [
    {
      id: "route-primary",
      name: "Rute Utama: By-Pass Lingkar Selatan",
      destination: "Menuju GOR Mini Kandanghaur (Titik Kumpul Utama)",
      distance: "1.8 km",
      duration: "±5–8 menit berkendara",
      elevation: "+2.2m dpl (Dataran Tinggi Kering)",
      status: "BEBAS_GENANGAN",
      statusLabel: "Jalur Kering Bebas Rob",
      vehicleSupport: "Aman untuk Roda 2, Roda 4 & Truk",
      note: "Jalur utama rekomendasi Satlak BPBD Indramayu dengan penerangan jalan aktif.",
    },
    {
      id: "route-secondary",
      name: "Rute Cepat: Tanggul Nelayan Barat",
      destination: "Menuju Balai Desa Eretan Wetan",
      distance: "850 m",
      duration: "±4–6 menit jalan kaki",
      elevation: "+1.8m dpl (Tanggul Beton)",
      status: "WASPADA",
      statusLabel: "Waspada Pasang",
      vehicleSupport: "Pejalan Kaki & Roda 2 Saja",
      note: "Hati-hati permukaan tanggul licin saat pasang laut maksimum pada malam hari.",
    },
  ];

  return (
    <>
      {/* Backdrop redup halus saat panel ditarik penuh */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 z-30 bg-black/25 md:hidden backdrop-blur-2xs"
          />
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* SLIDER / BOTTOM SHEET INTERAKTIF ALA GOOGLE MAPS (< MD)        */}
      {/* ============================================================== */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.y < -35 || info.velocity.y < -250) {
            setIsExpanded(true);
          } else if (info.offset.y > 35 || info.velocity.y > 250) {
            setIsExpanded(false);
          }
        }}
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={{
          collapsed: { y: "calc(100% - 150px)" },
          expanded: { y: 0 },
        }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="fixed bottom-[64px] left-0 right-0 z-40 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.18)] border-t border-slate-200/90 flex flex-col md:hidden max-h-[78vh] h-[78vh] overflow-hidden select-none"
      >
        {/* ============================================================ */}
        {/* HEADER SHEET: HANDLE DRAG & PEEK PREVIEW (SELALU MUNCUL)     */}
        {/* ============================================================ */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="pt-2 px-4 pb-2.5 shrink-0 cursor-pointer border-b border-slate-100 bg-white"
        >
          {/* Drag Handle Bar ala Google Maps */}
          <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-2.5 transition-colors hover:bg-slate-400" />

          {/* Baris Informasi Lokasi & Status */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h3 className="text-xs font-black text-slate-900 tracking-tight truncate">
                  Kandanghaur, Indramayu
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                  SIAGA II: ROB
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                Geser ke atas untuk rute evakuasi &amp; shelter posko
              </p>
            </div>

            {/* Widget Status TMA & Tombol Toggle Panah */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                <Droplets className="w-3 h-3 text-[#38746D]" />
                <span>+65 cm</span>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <ChevronUp className="w-4 h-4" />
              </motion.div>
            </div>
          </div>

          {/* Baris Quick Action Chips (Muncul di Peek Mode) */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-none py-0.5 -mx-1 px-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("rute");
                setIsExpanded(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EEF5F3] border border-[#38746D]/30 text-[10.5px] font-bold text-[#1D443F] shrink-0 active:scale-95 transition-all"
            >
              <Navigation className="w-3 h-3 text-[#38746D]" />
              <span>Rute Bebas Banjir</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("posko");
                setIsExpanded(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[10.5px] font-bold text-teal-800 shrink-0 active:scale-95 transition-all"
            >
              <Building2 className="w-3 h-3 text-teal-600" />
              <span>{shelters.length} Posko Terdekat</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KONTEN EXPANDED: TAB NAVIGASI & RINCIAN LENGKAP               */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20 bg-[#F8FAF9]">
          {/* Tab Filter Button */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("rute")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === "rute"
                  ? "bg-white text-[#1D443F] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🧭 Rute Evakuasi ({evacuationRoutes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("posko")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === "posko"
                  ? "bg-white text-[#1D443F] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🏠 Shelter Posko ({shelters.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pantau")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === "pantau"
                  ? "bg-white text-[#1D443F] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⚠️ Pantauan ({reports.length})
            </button>
          </div>

          {/* TAB 1: RUTE EVAKUASI AMAN */}
          {activeTab === "rute" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Rekomendasi Jalur Darat BPBD
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Update Real-time
                </span>
              </div>

              {evacuationRoutes.map((route, idx) => (
                <div
                  key={route.id}
                  className={`p-3.5 rounded-2xl bg-white border shadow-xs transition-all ${
                    idx === 0
                      ? "border-emerald-300 ring-2 ring-emerald-500/10"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">
                          {route.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 font-medium leading-snug">
                        {route.destination}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold shrink-0 ${
                        route.status === "BEBAS_GENANGAN"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {route.statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-100 text-[10.5px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Jarak:</span>
                      <strong className="text-slate-800">{route.distance}</strong>
                      <span className="text-slate-400">({route.duration})</span>
                    </div>
                    <div className="flex items-center gap-1 text-right justify-end">
                      <span className="text-slate-400">Elevasi:</span>
                      <strong className="text-slate-800">{route.elevation}</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 italic mt-1.5 leading-tight">
                    {route.note}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {route.vehicleSupport}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        if (shelters.length > 0 && onSelectShelter) {
                          onSelectShelter(shelters[0]);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-[#155E45] text-white text-xs font-bold hover:bg-[#1D443F] shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Pandu Rute Ini</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: SHELTER POSKO SIAGA */}
          {activeTab === "posko" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Daftar Shelter Evakuasi Terdekat
                </span>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Kapasitas Live
                </span>
              </div>

              {shelters.map((s) => {
                const percent = Math.min(
                  100,
                  Math.round((s.capacityFilled / s.capacityTotal) * 100)
                );
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (onSelectShelter) {
                        onSelectShelter(s);
                        setIsExpanded(false);
                      }
                    }}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-300 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <h4 className="text-xs font-extrabold text-slate-900 truncate">
                            {s.name}
                          </h4>
                        </div>
                        <p className="text-[10.5px] text-slate-500 mt-0.5 truncate">
                          {s.location} • {s.distance}
                        </p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold shrink-0 ${
                          s.status === "TERSEDIA"
                            ? "bg-emerald-100 text-emerald-800"
                            : s.status === "HAMPIR_PENUH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    {/* Progress Kuota Kapasitas */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 mb-1">
                        <span>Kapasitas Terisi:</span>
                        <strong className="text-slate-900">
                          {s.capacityFilled} / {s.capacityTotal} Jiwa ({percent}%)
                        </strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent > 85 ? "bg-rose-500" : percent > 60 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectShelter) onSelectShelter(s);
                          setIsExpanded(false);
                        }}
                        className="h-7 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4D3E] text-white text-[10.5px] font-black flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer border border-[#1B4D3E]"
                      >
                        <Navigation className="w-3 h-3 text-emerald-300" />
                        <span>Arahkan Rute</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${s.contactPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          title={`Hubungi ${s.contactPerson} (${s.contactPhone})`}
                          className="w-7 h-7 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 text-slate-700 flex items-center justify-center transition active:scale-95 shadow-2xs"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-teal-700" />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (navigator.share) {
                              navigator.share({
                                title: s.name,
                                text: `Posko Evakuasi DERMAYU: ${s.name} (${s.location}) - Kapasitas: ${s.capacityFilled}/${s.capacityTotal} Jiwa. Hubungi: ${s.contactPerson} (${s.contactPhone})`,
                                url: window.location.href,
                              }).catch(() => {});
                            } else {
                              navigator.clipboard?.writeText(`${s.name} - ${s.location}`);
                            }
                          }}
                          title="Bagikan Posko"
                          className="w-7 h-7 rounded-xl border border-slate-200 bg-white hover:bg-sky-50 text-slate-700 flex items-center justify-center transition active:scale-95 shadow-2xs"
                        >
                          <Share2 className="w-3.5 h-3.5 text-sky-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: PANTAUAN GENANGAN & TELEMETRI */}
          {activeTab === "pantau" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Titik Genangan Terverifikasi Lapangan
                </span>
                <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {reports.length} Laporan Aktif
                </span>
              </div>

              {reports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    if (onSelectReport) {
                      onSelectReport(r);
                      setIsExpanded(false);
                    }
                  }}
                  className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {r.title}
                        </h4>
                      </div>
                      <p className="text-[10.5px] text-slate-500 mt-0.5 truncate">
                        {r.location} • {r.timeAgo}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700 shrink-0">
                      {r.severity}
                    </span>
                  </div>

                  {r.waterLevelText && (
                    <div className="mt-2 text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                      Tinggi Air: {r.waterLevelText}
                    </div>
                  )}
                </div>
              ))}

              {/* Data Sensor TMA */}
              <div className="p-3.5 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0] space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-[#1D443F] font-bold">
                  <Activity className="w-4 h-4 text-[#38746D]" />
                  <span>Telemetri Sensor DAS Indramayu</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4B635F] pt-1">
                  <div>
                    Radar Muara: <strong className="text-[#132422]">+65 cm</strong>
                  </div>
                  <div>
                    Debit Cimanuk: <strong className="text-[#132422]">310 m³/s</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

