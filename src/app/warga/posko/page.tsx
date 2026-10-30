"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Building2,
  MapPin,
  PhoneCall,
  Navigation,
  CheckCircle2,
  Users,
  Search,
  ExternalLink,
} from "lucide-react";

interface ShelterItem {
  id: string;
  name: string;
  location: string;
  district: string;
  distance: string;
  capacityTotal: number;
  capacityFilled: number;
  facilities: string[];
  contactPerson: string;
  contactPhone: string;
  status: "TERSEDIA" | "HAMPIR_PENUH" | "PENUH";
  notes?: string;
}

export default function WargaPoskoPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("SEMUA");

  const shelters: ShelterItem[] = [
    {
      id: "sh-1",
      name: "Balai Desa Eretan Wetan",
      location: "Jl. Raya Pantura No. 45",
      district: "Kecamatan Kandanghaur",
      distance: "850 m (±4–6 menit)",
      capacityTotal: 250,
      capacityFilled: 185,
      facilities: ["Dapur Umum Tagana", "Posko Medis Puskesmas", "Ruang Balita & Lansia", "Genset Cadangan 5KVA"],
      contactPerson: "Bpk. Mulyadi (Kuwu)",
      contactPhone: "0813-8822-1920",
      status: "TERSEDIA",
      notes: "Logistik beras dan air bersih PDAM mencukupi untuk 3 hari ke depan.",
    },
    {
      id: "sh-2",
      name: "GOR Mini Kandanghaur",
      location: "Jl. Olahraga Blok Barat No. 12",
      district: "Kecamatan Kandanghaur",
      distance: "1.8 km (±8 menit)",
      capacityTotal: 500,
      capacityFilled: 310,
      facilities: ["Aula Terbuka Luas", "Sanitasi MCK (8 Unit)", "Stok Matras & Selimut", "Tenda Pengungsi BNPB"],
      contactPerson: "Ibu Ratna (Relawan Tagana)",
      contactPhone: "0821-4433-2100",
      status: "TERSEDIA",
      notes: "Titik evakuasi utama kendaraan roda empat & perahu evakuasi darat.",
    },
    {
      id: "sh-3",
      name: "SMP Negeri 1 Cantigi",
      location: "Jl. Ki Hajar Dewantara No. 04",
      district: "Kecamatan Cantigi",
      distance: "3.2 km",
      capacityTotal: 200,
      capacityFilled: 190,
      facilities: ["Ruang Kelas Tidur", "Tenaga Nakes Dokter Siaga", "Air Bersih Galon"],
      contactPerson: "Pak Hendra (Satlak Cantigi)",
      contactPhone: "0852-7711-9022",
      status: "HAMPIR_PENUH",
      notes: "Kapasitas tersisa tinggal 10 tempat tidur lagi.",
    },
    {
      id: "sh-4",
      name: "Aula Kantor Kecamatan Losarang",
      location: "Jl. Pantura Losarang KM 68",
      district: "Kecamatan Losarang",
      distance: "4.5 km",
      capacityTotal: 350,
      capacityFilled: 140,
      facilities: ["Posko Logistik Palang Merah", "Ambulans Siaga 24 Jam", "Dapur Umum Kemensos"],
      contactPerson: "Drs. H. Suwandi (Camat)",
      contactPhone: "0812-3344-5566",
      status: "TERSEDIA",
      notes: "Lokasi aman di pinggir jalur arteri dengan suplai listrik stabil.",
    },
  ];

  const filtered = shelters.filter((sh) => {
    const matchSearch =
      sh.name.toLowerCase().includes(search.toLowerCase()) ||
      sh.district.toLowerCase().includes(search.toLowerCase()) ||
      sh.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "SEMUA" || sh.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalKapasitas = shelters.reduce((acc, cur) => acc + cur.capacityTotal, 0);
  const totalTerisi = shelters.reduce((acc, cur) => acc + cur.capacityFilled, 0);

  return (
    <DashboardLayout role="warga" title="Pantauan Posko">
      <div className="space-y-6 text-left">
        {/* Banner Metrik Posko */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-1">
            <span className="text-xs font-bold text-[#4B635F] uppercase tracking-wider">Total Kapasitas Terpantau</span>
            <p className="text-2xl sm:text-3xl font-black text-[#132422]">{totalKapasitas} Jiwa</p>
            <p className="text-xs text-[#718783]">Tersebar di 4 posko evakuasi aktif BPBD</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-1">
            <span className="text-xs font-bold text-[#4B635F] uppercase tracking-wider">Warga Tertampung</span>
            <p className="text-2xl sm:text-3xl font-black text-[#38746D]">{totalTerisi} Jiwa</p>
            <p className="text-xs text-[#718783]">Tingkat okupansi rata-rata {Math.round((totalTerisi / totalKapasitas) * 100)}%</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-1">
            <span className="text-xs font-bold text-[#4B635F] uppercase tracking-wider">Sisa Kuota Tersedia</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{totalKapasitas - totalTerisi} Tempat</p>
            <p className="text-xs text-emerald-700 font-medium">Bebas biaya &bull; Dilengkapi logistik makanan</p>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-white rounded-3xl border border-[#D5E4E0] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama posko atau kecamatan..."
              className="w-full h-11 pl-10 pr-4 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D]"
            />
          </div>

          <div className="flex items-center gap-2">
            {["SEMUA", "TERSEDIA", "HAMPIR_PENUH"].map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === st
                    ? "bg-[#38746D] text-white shadow-xs"
                    : "bg-[#F8FAF9] text-[#4B635F] border border-[#D5E4E0] hover:bg-gray-100"
                }`}
              >
                {st === "SEMUA" ? "Semua Status" : st === "TERSEDIA" ? "Tersedia" : "Hampir Penuh"}
              </button>
            ))}
          </div>
        </section>

        {/* List Posko Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((sh) => {
            const sisa = sh.capacityTotal - sh.capacityFilled;
            const percent = Math.round((sh.capacityFilled / sh.capacityTotal) * 100);

            return (
              <div
                key={sh.id}
                className="bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-6 shadow-xs hover:border-[#38746D] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-[#132422]">{sh.name}</h3>
                      <p className="text-xs text-[#718783] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                        <span>{sh.location}, {sh.district}</span>
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        sh.status === "TERSEDIA"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {sh.status === "TERSEDIA" ? "Tersedia" : "Hampir Penuh"}
                    </span>
                  </div>

                  {/* Okupansi Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[#132422] font-bold">
                      <span>Okupansi: {sh.capacityFilled} / {sh.capacityTotal} Jiwa</span>
                      <span className="text-[#38746D]">{percent}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent >= 90 ? "bg-rose-500" : percent >= 70 ? "bg-amber-500" : "bg-[#38746D]"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#4B635F]">Tersedia sisa {sisa} tempat tidur.</p>
                  </div>

                  {/* Fasilitas */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sh.facilities.map((fac, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-lg bg-[#F8FAF9] border border-[#D5E4E0] text-[10px] font-medium text-[#4B635F]">
                        {fac}
                      </span>
                    ))}
                  </div>

                  {sh.notes && (
                    <p className="text-[11px] text-[#4B635F] bg-[#EEF5F3] p-2.5 rounded-xl border border-[#D5E4E0]">
                      <strong>Catatan Petugas:</strong> {sh.notes}
                    </p>
                  )}
                </div>

                {/* Footer Card */}
                <div className="pt-3 border-t border-[#D5E4E0]/60 flex items-center justify-between gap-3">
                  <a
                    href={`tel:${sh.contactPhone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#38746D] hover:underline font-bold"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{sh.contactPerson} ({sh.contactPhone})</span>
                  </a>

                  <Link
                    href="/warga/evakuasi"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Buka Rute</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </DashboardLayout>
  );
}
