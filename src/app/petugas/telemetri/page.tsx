"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Waves,
  Gauge,
  Radio,
  Wifi,
  BatteryCharging,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sliders,
  ShieldAlert,
} from "lucide-react";

interface TelemetryStation {
  id: string;
  name: string;
  type: "SUNGAI_CIMANUK" | "ROB_PESISIR" | "SALURAN_SEKUNDER";
  location: string;
  district: string;
  currentValue: number;
  unit: string;
  trend: "NAIK" | "TURUN" | "STABIL";
  status: "NORMAL" | "WASPADA" | "SIAGA_2" | "SIAGA_1";
  normalMax: number;
  waspadaMax: number;
  dangerThreshold: number;
  batteryPct: number;
  signalStrength: string;
  lastHeartbeat: string;
  readingLabel: string;
}

const stations: TelemetryStation[] = [
  {
    id: "st-01",
    name: "Sensor Pesisir Eretan Wetan (AWS-01)",
    type: "ROB_PESISIR",
    location: "Dermaga TPI Eretan Wetan",
    district: "Kandanghaur",
    currentValue: 65,
    unit: "cm",
    trend: "NAIK",
    status: "SIAGA_2",
    normalMax: 40,
    waspadaMax: 60,
    dangerThreshold: 80,
    batteryPct: 96,
    signalStrength: "-72 dBm (4G LTE)",
    lastHeartbeat: "30 detik yang lalu",
    readingLabel: "Tinggi Muka Pasang Laut",
  },
  {
    id: "st-02",
    name: "Bendung Rentang Hulu Cimanuk (AWS-02)",
    type: "SUNGAI_CIMANUK",
    location: "Kec. Jatitujuh - Majalengka / Perbatasan Indramayu",
    district: "Hulu Cimanuk",
    currentValue: 310,
    unit: "m³/s",
    trend: "STABIL",
    status: "NORMAL",
    normalMax: 450,
    waspadaMax: 700,
    dangerThreshold: 900,
    batteryPct: 100,
    signalStrength: "-65 dBm (Fiber BPBD)",
    lastHeartbeat: "10 detik yang lalu",
    readingLabel: "Debit Buangan Air (Q)",
  },
  {
    id: "st-03",
    name: "Muara Sungai Cantigi (AWS-03)",
    type: "ROB_PESISIR",
    location: "Muara Pesisir Laut Cantigi Kulon",
    district: "Cantigi",
    currentValue: 58,
    unit: "cm",
    trend: "NAIK",
    status: "WASPADA",
    normalMax: 40,
    waspadaMax: 60,
    dangerThreshold: 80,
    batteryPct: 92,
    signalStrength: "-84 dBm (LoRa Gateway)",
    lastHeartbeat: "1 menit yang lalu",
    readingLabel: "Elevasi Genangan Pasang",
  },
  {
    id: "st-04",
    name: "Tanggul Kritis Sukagumiwang (AWS-04)",
    type: "SUNGAI_CIMANUK",
    location: "Tanggul Kali Cimanuk Km 34",
    district: "Sukagumiwang",
    currentValue: 3.4,
    unit: "meter",
    trend: "STABIL",
    status: "NORMAL",
    normalMax: 4.5,
    waspadaMax: 5.5,
    dangerThreshold: 6.5,
    batteryPct: 88,
    signalStrength: "-78 dBm (4G LTE)",
    lastHeartbeat: "45 detik yang lalu",
    readingLabel: "Tinggi Muka Air (TMA)",
  },
];

export default function PetugasTelemetriPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleRefreshSensors = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setNotification("Data telemetri IoT terbaru dari 4 stasiun berhasil disinkronisasi.");
      setTimeout(() => setNotification(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
        {/* Banner Alert Sukses */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs font-bold text-emerald-700 underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* HEADER TELEMETRI & TOMBOL SYNC */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-[#1D443F] to-[#132422] text-white shadow-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#88BDB6]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Jaringan Telemetri IoT Beroperasi Normal
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Pemantauan Real-Time Pasang Rob & Hulu Cimanuk
            </h2>
            <p className="text-xs text-[#D1E5E2] max-w-xl">
              Data telemetri diperbarui otomatis setiap 30 detik melalui integrasi sensor ultrasonik LoRaWAN dan SCADA Bendung Rentang.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshSensors}
            disabled={isRefreshing}
            className="px-5 py-3 rounded-2xl bg-[#38746D] hover:bg-[#4d978e] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Menyinkronkan..." : "Sinkronkan Sensor Sekarang"}
          </button>
        </div>

        {/* GRID KARTU SENSOR TELEMETRI LENGKAP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {stations.map((st) => {
            const isCritical = st.status === "SIAGA_1" || st.status === "SIAGA_2";
            const isWarning = st.status === "WASPADA";

            return (
              <div
                key={st.id}
                className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-5 hover:border-[#88BDB6] transition-all"
              >
                {/* Station Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {st.type === "ROB_PESISIR" ? "Sensor Pasang Rob" : "Sensor Aliran Cimanuk"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#132422] mt-0.5">{st.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{st.location}, Kec. {st.district}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-black uppercase shrink-0 ${
                      isCritical
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : isWarning
                        ? "bg-yellow-100 text-yellow-900 border border-yellow-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    {st.status.replace("_", " ")}
                  </span>
                </div>

                {/* Main Value Display */}
                <div className="p-5 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#4B635F] font-semibold">{st.readingLabel}</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-[#1D443F]">
                        {st.currentValue}
                      </span>
                      <span className="text-sm font-bold text-[#38746D]">{st.unit}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-xs font-bold flex items-center gap-1 justify-end text-amber-700">
                      {st.trend === "NAIK" ? (
                        <>
                          <ArrowUpRight className="w-4 h-4 text-amber-600" />
                          <span>Tren Naik (+3cm/jam)</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                          <span>Kondisi Stabil</span>
                        </>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500">Ambang Siaga: &gt; {st.dangerThreshold} {st.unit}</p>
                  </div>
                </div>

                {/* Indikator Ambang Batas 3 Level */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-600 font-semibold">
                    <span>Normal (&lt;{st.normalMax})</span>
                    <span>Waspada ({st.normalMax}-{st.waspadaMax})</span>
                    <span className="text-rose-600">Bahaya (&gt;{st.dangerThreshold})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 flex overflow-hidden">
                    <div className="w-1/3 bg-emerald-500" />
                    <div className="w-1/3 bg-amber-400" />
                    <div className="w-1/3 bg-rose-500" />
                  </div>
                </div>

                {/* Hardware Telemetri Health */}
                <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Solar: {st.batteryPct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                    <span className="truncate">{st.signalStrength}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-500 truncate">{st.lastHeartbeat}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}
