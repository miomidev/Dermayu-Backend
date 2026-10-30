"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Users,
  Search,
  Filter,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  MapPin,
  ExternalLink,
  Building2,
  Layers,
  Utensils,
  HeartPulse,
  Package,
} from "lucide-react";

interface Shelter {
  id: string;
  name: string;
  village: string;
  district: string;
  address: string;
  coordinator: string;
  phone: string;
  capacity: number;
  occupancy: number;
  status: "AKTIF" | "SIAGA" | "PENUH";
  logistics: {
    food: "Aman" | "Menipis" | "Kritis";
    medical: "Lengkap" | "Perlu Tambahan";
    blankets: "Cukup" | "Kurang";
    cleanWater: "Tersedia" | "Perlu Truk Tangki";
  };
}

const initialShelters: Shelter[] = [
  {
    id: "pos-01",
    name: "Balai Desa Eretan Wetan",
    village: "Eretan Wetan",
    district: "Kandanghaur",
    address: "Jl. Raya Pantura Eretan No. 12",
    coordinator: "Bpk. Waryono (Kades)",
    phone: "0812-9876-5432",
    capacity: 250,
    occupancy: 215,
    status: "AKTIF",
    logistics: {
      food: "Aman",
      medical: "Lengkap",
      blankets: "Kurang",
      cleanWater: "Tersedia",
    },
  },
  {
    id: "pos-02",
    name: "Gedung IPHI Kandanghaur",
    village: "Karanganyar",
    district: "Kandanghaur",
    address: "Jl. Lapang Kandanghaur No. 4",
    coordinator: "H. Mustofa",
    phone: "0852-3344-5566",
    capacity: 400,
    occupancy: 388,
    status: "PENUH",
    logistics: {
      food: "Menipis",
      medical: "Perlu Tambahan",
      blankets: "Kurang",
      cleanWater: "Perlu Truk Tangki",
    },
  },
  {
    id: "pos-03",
    name: "SMPN 1 Cantigi",
    village: "Cantigi Kulon",
    district: "Cantigi",
    address: "Jl. Mayor Dasuki No. 88, Cantigi",
    coordinator: "Drs. Suherman",
    phone: "0877-2233-4455",
    capacity: 300,
    occupancy: 95,
    status: "AKTIF",
    logistics: {
      food: "Aman",
      medical: "Lengkap",
      blankets: "Cukup",
      cleanWater: "Tersedia",
    },
  },
  {
    id: "pos-04",
    name: "Aula Kecamatan Losarang",
    village: "Jangga",
    district: "Losarang",
    address: "Jl. Raya Losarang Km 15",
    coordinator: "Ibu Nurlaela (Kasi Trantib)",
    phone: "0813-1122-8899",
    capacity: 200,
    occupancy: 42,
    status: "AKTIF",
    logistics: {
      food: "Aman",
      medical: "Lengkap",
      blankets: "Cukup",
      cleanWater: "Tersedia",
    },
  },
  {
    id: "pos-05",
    name: "Balai Pelatihan Pertanian Sukagumiwang",
    village: "Sukagumiwang",
    district: "Sukagumiwang",
    address: "Bantaran Kali Cimanuk Hilir",
    coordinator: "Bpk. Rahmat S.",
    phone: "0821-4455-6677",
    capacity: 150,
    occupancy: 0,
    status: "SIAGA",
    logistics: {
      food: "Aman",
      medical: "Lengkap",
      blankets: "Cukup",
      cleanWater: "Tersedia",
    },
  },
];

export default function PetugasPoskoPage() {
  const [shelters, setShelters] = useState<Shelter[]>(initialShelters);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  // Totals
  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupants = shelters.reduce((acc, s) => acc + s.occupancy, 0);
  const totalAvailable = totalCapacity - totalOccupants;
  const occupancyRate = Math.round((totalOccupants / totalCapacity) * 100);

  const handleAdjustOccupancy = (id: string, delta: number) => {
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newOccupancy = Math.max(0, Math.min(s.capacity, s.occupancy + delta));
        const newStatus =
          newOccupancy >= s.capacity
            ? "PENUH"
            : newOccupancy > 0
            ? "AKTIF"
            : "SIAGA";
        return { ...s, occupancy: newOccupancy, status: newStatus };
      })
    );
    setNotification(`Kapasitas posko berhasil diperbarui.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredShelters = shelters.filter((s) => {
    const matchDistrict = districtFilter === "ALL" || s.district === districtFilter;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.coordinator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDistrict && matchSearch;
  });

  return (
    <div className="space-y-6">
        {/* Banner Notifikasi */}
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

        {/* METRIK KAPASITAS PENGUNGSI KABUPATEN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Pengungsi Terdata
            </span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-[#1D443F]">{totalOccupants.toLocaleString("id-ID")}</h3>
              <span className="text-xs text-gray-500">jiwa</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#38746D] h-full rounded-full transition-all duration-300"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <p className="text-[11px] text-[#4B635F]">Tingkat keterisian: {occupancyRate}%</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Sisa Ruang Kosong
            </span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-emerald-600">{totalAvailable.toLocaleString("id-ID")}</h3>
              <span className="text-xs text-gray-500">jiwa tersisa</span>
            </div>
            <p className="text-[11px] text-gray-500">Daya tampung maksimum {totalCapacity} jiwa di 5 titik posko</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Posko Terisi Penuh
            </span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-rose-600">
                {shelters.filter((s) => s.status === "PENUH").length}
              </h3>
              <span className="text-xs text-gray-500">posko perlu alihan</span>
            </div>
            <p className="text-[11px] text-rose-700 font-medium">Alihkan rute evakuasi warga ke Balai Desa Eretan</p>
          </div>

          <div className="p-5 rounded-3xl bg-[#1D443F] text-white shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#88BDB6] uppercase tracking-wider">
                Logistik & Dapur Terpadu
              </span>
              <h4 className="text-base font-bold mt-1">Dapur Umum Lapangan</h4>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
              <span className="text-[#D1E5E2]">Kebutuhan Pangan</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-[#1D443F] font-extrabold text-[10px]">
                Status Aman
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "Kandanghaur", "Cantigi", "Losarang", "Sukagumiwang"].map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => setDistrictFilter(dist)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  districtFilter === dist
                    ? "bg-[#1D443F] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-[#D5E4E0] hover:bg-gray-50"
                }`}
              >
                {dist === "ALL" ? "Semua Kecamatan" : dist}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama posko, koordinator, desa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] transition-colors"
            />
          </div>
        </div>

        {/* DAFTAR POSKO KARTU LENGKAP DENGAN KONTROL REAL-TIME */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredShelters.map((shelter) => {
            const pct = Math.round((shelter.occupancy / shelter.capacity) * 100);
            const isFull = shelter.status === "PENUH" || pct >= 95;

            return (
              <div
                key={shelter.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4 hover:border-[#88BDB6] transition-all"
              >
                {/* Header Posko */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#EEF5F3] text-[#1D443F] flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#132422]">{shelter.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {shelter.address}, Kec. {shelter.district}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      isFull
                        ? "bg-rose-100 text-rose-700 border border-rose-300"
                        : shelter.status === "SIAGA"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    {shelter.status}
                  </span>
                </div>

                {/* Progress Keterisian & Indikator Angka */}
                <div className="space-y-1.5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">Kapasitas Penghuni</span>
                    <span className="font-black text-[#1D443F]">
                      {shelter.occupancy} / {shelter.capacity} jiwa ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull
                          ? "bg-rose-600"
                          : pct > 75
                          ? "bg-amber-500"
                          : "bg-[#1D443F]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* KONTROL PENGATUR JUMLAH PENGUNGSI (REAL-TIME ADAPTIVE) */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-gray-500 font-medium">
                      Pencatatan Rombongan Warga:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustOccupancy(shelter.id, -5)}
                        disabled={shelter.occupancy <= 0}
                        className="px-2.5 py-1 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-white disabled:opacity-30 cursor-pointer"
                        title="Kurangi 5 jiwa"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustOccupancy(shelter.id, -1)}
                        disabled={shelter.occupancy <= 0}
                        className="px-2 py-1 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-white disabled:opacity-30 cursor-pointer"
                        title="Kurangi 1 jiwa"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustOccupancy(shelter.id, 1)}
                        disabled={shelter.occupancy >= shelter.capacity}
                        className="px-2 py-1 rounded-lg bg-[#EEF5F3] border border-[#88BDB6] text-xs font-bold text-[#1D443F] hover:bg-teal-100 disabled:opacity-30 cursor-pointer"
                        title="Tambah 1 jiwa"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustOccupancy(shelter.id, 5)}
                        disabled={shelter.occupancy >= shelter.capacity}
                        className="px-2.5 py-1 rounded-lg bg-[#1D443F] text-xs font-bold text-white hover:bg-[#38746D] disabled:opacity-30 cursor-pointer shadow-xs"
                        title="Tambah rombongan 5 jiwa"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Kebutuhan Logistik */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#38746D]" />
                    <div>
                      <div className="text-[10px] text-gray-500">Pangan</div>
                      <div className="font-bold text-gray-800">{shelter.logistics.food}</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                    <div>
                      <div className="text-[10px] text-gray-500">Medis</div>
                      <div className="font-bold text-gray-800">{shelter.logistics.medical}</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <div>
                      <div className="text-[10px] text-gray-500">Selimut</div>
                      <div className="font-bold text-gray-800">{shelter.logistics.blankets}</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <div>
                      <div className="text-[10px] text-gray-500">Air Bersih</div>
                      <div className="font-bold text-gray-800">{shelter.logistics.cleanWater}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Koordinator & Kontak */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-gray-500">PJ Posko: </span>
                    <span className="font-bold text-gray-900">{shelter.coordinator}</span>
                  </div>
                  <a
                    href={`tel:${shelter.phone.replace(/[^0-9]/g, "")}`}
                    className="px-3 py-1.5 rounded-xl border border-[#D5E4E0] hover:bg-gray-50 text-xs font-bold text-[#1D443F] flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Hubungi PJ
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}

