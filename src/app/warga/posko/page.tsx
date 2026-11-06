"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CURATED_POSKO_LIST } from "@/data/curatedEvakuasiData";
import {
  Building2,
  MapPin,
  PhoneCall,
  Navigation,
  CheckCircle2,
  Search,
  ExternalLink,
  ShieldCheck,
  Utensils,
  Stethoscope,
  Baby,
  Zap,
  Compass,
  AlertTriangle,
  RefreshCw,
  X,
  SlidersHorizontal,
} from "lucide-react";

interface ShelterItem {
  id: string;
  name: string;
  location: string;
  district: string;
  distance: string;
  elevation: string;
  accessRoad: string;
  capacityTotal: number;
  capacityFilled: number;
  facilities: string[];
  contactPerson: string;
  contactPhone: string;
  status: "TERSEDIA" | "HAMPIR_PENUH" | "PENUH";
  notes?: string;
  lat: number;
  lng: number;
}

export default function WargaPoskoPage() {
  const [search, setSearch] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("SEMUA");
  const [filterStatus, setFilterStatus] = useState("SEMUA");
  const [visibleCount, setVisibleCount] = useState(12);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const activeFilterCount = (filterDistrict !== "SEMUA" ? 1 : 0) + (filterStatus !== "SEMUA" ? 1 : 0);

  const curatedItems: ShelterItem[] = CURATED_POSKO_LIST.map((p) => ({
    id: p.id,
    name: p.nama,
    location: p.alamat,
    district: p.kecamatan,
    distance: "1.2 km",
    elevation: "+2.5m dpl (Tinggi Bebas Genangan)",
    accessRoad: "Jalan Poros Utama Bebas Banjir (Aspal)",
    capacityTotal: p.kapasitas,
    capacityFilled: p.terisi,
    facilities: p.fasilitas,
    contactPerson: p.kontak.pj,
    contactPhone: p.kontak.telp,
    status: p.status,
    notes: `Posko ${p.kategori === "sekolah" ? "Sekolah" : p.kategori === "masjid" ? "Masjid Jami'" : p.kategori === "balai_desa" ? "Balai Desa / Kuwu" : "Gedung Serbaguna"} di dataran tinggi aman bebas banjir rob & luapan sungai.`,
    lat: p.lat,
    lng: p.lng,
  }));

  const [shelters] = useState<ShelterItem[]>(curatedItems);

  const DISTRICTS = [
    "SEMUA",
    "Kandanghaur",
    "Cantigi",
    "Losarang",
    "Pasekan",
    "Indramayu",
    "Jatibarang",
    "Anjatan",
    "Haurgeulis",
    "Juntinyuat",
    "Karangampel",
  ];

  const filtered = shelters.filter((sh) => {
    const matchSearch =
      sh.name.toLowerCase().includes(search.toLowerCase()) ||
      sh.district.toLowerCase().includes(search.toLowerCase()) ||
      sh.location.toLowerCase().includes(search.toLowerCase()) ||
      sh.facilities.some((f) => f.toLowerCase().includes(search.toLowerCase()));

    const matchDistrict =
      filterDistrict === "SEMUA" ||
      sh.district.toLowerCase() === filterDistrict.toLowerCase();

    const matchStatus = filterStatus === "SEMUA" || sh.status === filterStatus;

    return matchSearch && matchDistrict && matchStatus;
  });


  const getFacilityBadge = (fac: string) => {
    const lower = fac.toLowerCase();
    if (lower.includes("dapur") || lower.includes("logistik") || lower.includes("air")) {
      return {
        icon: Utensils,
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    }
    if (
      lower.includes("medis") ||
      lower.includes("puskesmas") ||
      lower.includes("dokter") ||
      lower.includes("bidan") ||
      lower.includes("ambulans")
    ) {
      return {
        icon: Stethoscope,
        color: "bg-sky-50 text-sky-800 border-sky-200",
      };
    }
    if (lower.includes("balita") || lower.includes("lansia") || lower.includes("anak")) {
      return {
        icon: Baby,
        color: "bg-purple-50 text-purple-800 border-purple-200",
      };
    }
    if (lower.includes("genset") || lower.includes("listrik")) {
      return {
        icon: Zap,
        color: "bg-amber-50 text-amber-800 border-amber-200",
      };
    }
    return {
      icon: ShieldCheck,
      color: "bg-[#F8FAF9] text-[#4B635F] border-[#D5E4E0]",
    };
  };

  return (
    <div className="space-y-6 text-left">
      {/* DUA CARD TERPISAH (FULL ROUNDED): CARD SEARCH (KIRI) & TOMBOL FILTER (KANAN) */}
      <section className="relative z-30" ref={filterDropdownRef}>
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Card 1: Input Search Bar (Full Rounded Card) */}
          <div className="flex-1 bg-white rounded-full border border-[#D5E4E0] shadow-xs flex items-center px-4 h-12 gap-2.5 focus-within:border-[#38746D] transition-all">
            <Search className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama posko, kecamatan, desa, atau fasilitas..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#132422] placeholder-gray-400 outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer shrink-0"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Card 2: Tombol Filter (Full Rounded Card) */}
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className={`h-12 w-12 sm:w-auto sm:px-4.5 rounded-full border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer shrink-0 shadow-xs ${
              isFilterOpen || activeFilterCount > 0
                ? "bg-[#38746D] text-white border-[#38746D]"
                : "bg-white hover:bg-[#F8FAF9] text-[#1D443F] border-[#D5E4E0]"
            }`}
            title="Filter Posko"
            aria-expanded={isFilterOpen}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-400 text-[#132422] text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* DROPDOWN VIEW MENGAMBANG DI BAWAH */}
        {isFilterOpen && (
          <div className="absolute top-full right-0 w-full sm:w-[420px] mt-2.5 bg-white rounded-3xl border border-[#D5E4E0] p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            {/* Header Dropdown */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#38746D]" />
                <h4 className="text-sm font-extrabold text-[#132422]">Filter Posko</h4>
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDistrict("SEMUA");
                      setFilterStatus("SEMUA");
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  title="Tutup Filter"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Status Ketersediaan */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-[#4B635F] uppercase tracking-wider block">
                Status Ketersediaan
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "SEMUA", label: "Semua Status" },
                  { id: "TERSEDIA", label: "✓ Tersedia" },
                  { id: "HAMPIR_PENUH", label: "⚠ Hampir Penuh" },
                ].map((st) => (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => setFilterStatus(st.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === st.id
                        ? "bg-[#38746D] text-white shadow-xs"
                        : "bg-[#F8FAF9] text-[#4B635F] border border-[#D5E4E0] hover:bg-gray-100"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Wilayah / Kecamatan */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-[#4B635F] uppercase tracking-wider block">
                Wilayah Kecamatan
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                {DISTRICTS.map((dist) => (
                  <button
                    type="button"
                    key={dist}
                    onClick={() => setFilterDistrict(dist)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer text-xs ${
                      filterDistrict === dist
                        ? "bg-[#EEF5F3] text-[#1D443F] border border-[#38746D] shadow-2xs"
                        : "bg-[#F8FAF9] text-[#4B635F] border border-[#D5E4E0] hover:bg-gray-100"
                    }`}
                  >
                    {dist === "SEMUA" ? "Semua Wilayah" : `Kec. ${dist}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Dropdown */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">
                {filtered.length} posko ditemukan
              </span>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="px-5 py-2 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                Terapkan
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. DAFTAR KARTU POSKO EVAKUASI AKTIF */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 p-12 rounded-3xl bg-white border border-[#D5E4E0] text-center space-y-2">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-base font-bold text-gray-700">Posko Tidak Ditemukan</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Tidak ada posko yang cocok dengan kata kunci &quot;{search}&quot; atau filter yang dipilih. Silakan reset filter pencarian Anda.
            </p>
          </div>
        ) : (
          filtered.slice(0, visibleCount).map((sh) => {
            const sisa = sh.capacityTotal - sh.capacityFilled;
            const percent = Math.round((sh.capacityFilled / sh.capacityTotal) * 100);

            return (
              <div
                key={sh.id}
                className="bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-6 shadow-xs hover:border-[#38746D] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header Posko & Status Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-extrabold text-[#38746D] uppercase tracking-wider bg-[#EEF5F3] px-2 py-0.5 rounded-md border border-[#38746D]/20">
                          Kec. {sh.district}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[11px] font-semibold text-[#4B635F]">
                          {sh.distance}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-[#132422] leading-snug">
                        {sh.name}
                      </h3>
                      <p className="text-xs text-[#718783] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                        <span className="truncate">{sh.location}</span>
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold shrink-0 ${
                        sh.status === "TERSEDIA"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {sh.status === "TERSEDIA" ? "✓ Tersedia" : "⚠ Hampir Penuh"}
                    </span>
                  </div>

                  {/* Elevasi & Akses Jalan Aman */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] bg-[#F8FAF9] p-2.5 rounded-xl border border-[#D5E4E0]">
                    <div className="flex items-center gap-1 text-[#1D443F] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{sh.elevation}</span>
                    </div>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <div className="flex items-center gap-1 text-[#4B635F] text-[10.5px]">
                      <span>Jalur: {sh.accessRoad}</span>
                    </div>
                  </div>

                  {/* Meter Okupansi Kapasitas */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex justify-between text-xs font-bold text-[#132422]">
                      <span>
                        Kapasitas: {sh.capacityFilled} / {sh.capacityTotal} Jiwa
                      </span>
                      <span
                        className={
                          percent >= 90
                            ? "text-rose-600"
                            : percent >= 70
                            ? "text-amber-700"
                            : "text-emerald-700"
                        }
                      >
                        {percent}% Terisi
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 90
                            ? "bg-rose-500"
                            : percent >= 70
                            ? "bg-amber-500"
                            : "bg-[#38746D]"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#4B635F]">
                      Tersedia sisa <strong>{sisa} tempat tidur</strong> untuk warga terdampak.
                    </p>
                  </div>

                  {/* Fasilitas Posko dengan Ikon Semantik */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                      Fasilitas Aktif:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sh.facilities.map((fac, i) => {
                        const badge = getFacilityBadge(fac);
                        const Icon = badge.icon;
                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10.5px] font-semibold ${badge.color}`}
                          >
                            <Icon className="w-3 h-3 shrink-0" />
                            <span>{fac}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Catatan Logistik Petugas Lapangan */}
                  {sh.notes && (
                    <div className="text-[11px] text-[#4B635F] bg-[#EEF5F3] p-3 rounded-2xl border border-[#D5E4E0] leading-relaxed">
                      <strong className="text-[#1D443F] block mb-0.5">
                        Info Lapangan BPBD:
                      </strong>
                      <span>{sh.notes}</span>
                    </div>
                  )}
                </div>

                {/* Footer Card: Kontak & 2 Opsi Navigasi Nyata */}
                <div className="pt-3.5 border-t border-[#D5E4E0]/80 flex flex-wrap items-center justify-between gap-2">
                  {/* Telepon Langsung */}
                  <a
                    href={`tel:${sh.contactPhone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D5E4E0] hover:bg-[#EEF5F3] text-xs font-bold text-[#1D443F] transition-all cursor-pointer"
                    title={`Hubungi ${sh.contactPerson}`}
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{sh.contactPerson}</span>
                  </a>

                  {/* Action Group: Peta Dasbor & Google Maps */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href="/warga/dashboard"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#EEF5F3] hover:bg-[#D5E4E0] text-[#1D443F] text-xs font-bold border border-[#38746D]/20 transition-all cursor-pointer"
                      title="Lihat Titik Ini di Peta Dasbor Spasial"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#38746D]" />
                      <span>Peta Dasbor</span>
                    </Link>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${sh.lat},${sh.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                      title="Buka Navigasi Rute di Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#88BDB6]" />
                      <span>Rute GPS</span>
                      <ExternalLink className="w-3 h-3 text-white/70" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Tombol Muat Lebih Banyak Posko */}
      {filtered.length > visibleCount && (
        <div className="flex justify-center pt-2 pb-6">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 16)}
            className="px-5 py-2.5 rounded-2xl bg-[#EEF5F3] hover:bg-[#D5E4E0] text-[#1D443F] font-bold text-xs border border-[#38746D]/30 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>Muat Lebih Banyak Posko ({visibleCount} dari {filtered.length} posko ditampilkan)</span>
          </button>
        </div>
      )}
    </div>
  );
}
