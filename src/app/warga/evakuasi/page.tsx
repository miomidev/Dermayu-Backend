"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Navigation,
  Compass,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building2,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
  Info,
} from "lucide-react";

interface ShelterItem {
  id: string;
  name: string;
  location: string;
  distance: string;
  elevation: string;
  capacityTotal: number;
  capacityFilled: number;
  status: "TERSEDIA" | "HAMPIR_PENUH";
  contactPerson: string;
  contactPhone: string;
  routeSummary: string;
  safeRoads: string[];
}

export default function WargaEvakuasiPage() {
  const shelters: ShelterItem[] = [
    {
      id: "sh-1",
      name: "Balai Desa Eretan Wetan",
      location: "Jl. Raya Pantura No. 45, Kandanghaur",
      distance: "850 m (±4–6 menit jalan kaki)",
      elevation: "+1.8m dpl (Tinggi Bebas Banjir)",
      capacityTotal: 250,
      capacityFilled: 185,
      status: "TERSEDIA",
      contactPerson: "Bpk. Mulyadi (Kuwu)",
      contactPhone: "0813-8822-1920",
      routeSummary: "Melalui Jalur Tanggul Barat → Jembatan Beton → Lapangan Desa",
      safeRoads: ["Jalur Tanggul Nelayan Barat (Aman)", "Jembatan Beton Sekunder (Kering)", "Jl. Desa RT 02 (Bebas Air)"],
    },
    {
      id: "sh-2",
      name: "GOR Mini Kandanghaur",
      location: "Jl. Olahraga Blok Barat, Kandanghaur",
      distance: "1.8 km (±8 menit kendaraan)",
      elevation: "+2.2m dpl (Titik Kumpul Utama)",
      capacityTotal: 500,
      capacityFilled: 310,
      status: "TERSEDIA",
      contactPerson: "Ibu Ratna (Relawan Tagana)",
      contactPhone: "0821-4433-2100",
      routeSummary: "Melalui Jalan Lingkar Selatan Pantura",
      safeRoads: ["By-Pass Lingkar Selatan (Aspal Kering)", "Akses Simpang Tiga Koramil"],
    },
    {
      id: "sh-3",
      name: "SMP Negeri 1 Cantigi",
      location: "Jl. Ki Hajar Dewantara, Cantigi",
      distance: "3.2 km (Jalur Tanggul Barat)",
      elevation: "+1.6m dpl",
      capacityTotal: 200,
      capacityFilled: 190,
      status: "HAMPIR_PENUH",
      contactPerson: "Pak Hendra (Satlak Cantigi)",
      contactPhone: "0852-7711-9022",
      routeSummary: "Akses perahu LCR atau tanggul primer timur",
      safeRoads: ["Tanggul Primer Saluran Induk Cantigi"],
    },
  ];

  const [selectedShelter, setSelectedShelter] = useState<ShelterItem>(shelters[0]);

  return (
    <DashboardLayout role="warga" title="Navigasi Evakuasi Aman">
      <div className="space-y-6 text-left">
        {/* Banner Status Rute */}
        <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1D443F] to-[#24544E] text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
              <Compass className="w-4 h-4 text-amber-300 animate-spin" />
              <span>SISTEM NAVIGASI JALUR DARAT BEBAS GENANGAN</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black">
              Panduan Jalur Evakuasi Menuju Posko Aman
            </h2>
            <p className="text-xs sm:text-sm text-[#D1E5E2] max-w-2xl leading-relaxed">
              Sistem menghitung elevasi jalan tertinggi dan menghindari titik genangan kritis rob air laut secara real-time berdasarkan data telemetri BPBD Indramayu.
            </p>
          </div>
        </section>

        {/* Visualisasi Peta Rute Terpilih */}
        <section className="bg-white rounded-3xl border border-[#D5E4E0] p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#132422] flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#38746D]" />
                Rute Aktif: {selectedShelter.name}
              </h3>
              <p className="text-xs text-[#4B635F] mt-0.5">
                Elevasi: <strong>{selectedShelter.elevation}</strong> &bull; Jarak Tempuh: <strong>{selectedShelter.distance}</strong>
              </p>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                selectedShelter.name + " " + selectedShelter.location
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>Buka Petunjuk Arah GPS</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Visual Route Canvas */}
          <div className="w-full h-64 sm:h-72 rounded-2xl bg-[#EEF5F3] border-2 border-dashed border-[#A4C6C1] relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38746D_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 space-y-3 max-w-lg">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>RUTE BEBAS GENANGAN TERVERIFIKASI</span>
              </span>

              <h4 className="text-base sm:text-lg font-black text-[#132422]">
                {selectedShelter.routeSummary}
              </h4>

              <div className="p-3 bg-white/95 rounded-xl border border-[#D5E4E0] text-xs text-[#4B635F] space-y-1 text-left">
                <p className="font-bold text-[#132422]">Ruas Jalan Aman Dilalui:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {selectedShelter.safeRoads.map((road, i) => (
                    <li key={i}>{road}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="absolute bottom-3 left-4 right-4 bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-rose-800">
              <span className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Peringatan: Hindari Jl. Muara Lama KM 2 (Rob mencapai 70 cm, arus deras).</span>
              </span>
              <span className="font-bold text-rose-900 hidden sm:inline">Jalur Ditutup BPBD</span>
            </div>
          </div>
        </section>

        {/* Pilihan Titik Posko Lainnya */}
        <section className="bg-white rounded-3xl border border-[#D5E4E0] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-[#132422] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#38746D]" />
            Pilih Posko Pengungsian Tujuan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shelters.map((sh) => {
              const isChosen = selectedShelter.id === sh.id;
              const sisa = sh.capacityTotal - sh.capacityFilled;
              return (
                <div
                  key={sh.id}
                  onClick={() => setSelectedShelter(sh)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isChosen
                      ? "bg-[#EEF5F3] border-[#38746D] shadow-xs ring-2 ring-[#38746D]/20"
                      : "bg-[#F8FAF9] border-[#D5E4E0] hover:border-[#38746D]"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#132422]">{sh.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#38746D] border border-[#D5E4E0]">
                        {sh.distance}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{sh.location}</p>
                    <p className="text-[11px] text-[#38746D] font-semibold">
                      Sisa Kuota: {sisa} Jiwa ({sh.capacityFilled}/{sh.capacityTotal})
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#D5E4E0]/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#38746D]">
                      {isChosen ? "✓ Rute Terpilih" : "Pilih Posko"}
                    </span>
                    <a
                      href={`tel:${sh.contactPhone.replace(/[^0-9]/g, "")}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-[#4B635F] hover:text-[#38746D] flex items-center gap-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{sh.contactPhone}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

