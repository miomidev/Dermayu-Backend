"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { getWargaPosko, fetchPoskoFromApi, type PoskoRecord } from "@/utils/poskoService";
import { trackFeatureInteraction } from "@/utils/activityTracker";
import {
  Building2,
  MapPin,
  PhoneCall,
  Navigation,
  Search,
  ExternalLink,
  ShieldCheck,
  Utensils,
  Stethoscope,
  Baby,
  Zap,
  Compass,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function WargaPoskoPage() {
  const [search, setSearch] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("SEMUA");
  const [filterStatus, setFilterStatus] = useState("SEMUA");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // State Pagination Modern
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // State Lightbox Modal Foto Dokumentasi Posko
  const [selectedLightbox, setSelectedLightbox] = useState<{
    title: string;
    photos: string[];
    index: number;
  } | null>(null);

  // Data Posko (Aturan 4: Hanya posko aktif yang dimuat untuk warga)
  const [shelters, setShelters] = useState<PoskoRecord[]>([]);

  useEffect(() => {
    // 1. Muat cache posko aktif awal untuk instant render
    setShelters(getWargaPosko());

    // 2. Fetch data SSOT dari Server Database
    const syncFromServer = async () => {
      try {
        const data = await fetchPoskoFromApi("warga");
        setShelters(data.filter((p) => p.isActive === true));
      } catch (err) {
        console.warn("Sync warga posko error, using local fallback:", err);
      } finally {
        setIsLoading(false);
      }
    };
    syncFromServer();

    // 3. Polling setiap 60 detik & sinkronisasi saat tab aktif kembali
    const interval = setInterval(syncFromServer, 60000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncFromServer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Dengarkan event sinkronisasi data posko real-time
    const handleUpdate = () => {
      setShelters(getWargaPosko());
    };
    window.addEventListener("dermayu_posko_updated", handleUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("dermayu_posko_updated", handleUpdate);
    };
  }, []);

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

  // Filter 100 data posko
  const filtered = useMemo(() => {
    return shelters.filter((sh) => {
      if (!sh) return false;
      const q = (search || "").trim().toLowerCase();
      const nama = (sh.nama || (sh as any).name || "").toLowerCase();
      const kecamatan = (sh.kecamatan || (sh as any).district || "").toLowerCase();
      const alamat = (sh.alamat || (sh as any).location || "").toLowerCase();

      const matchSearch =
        !q ||
        nama.includes(q) ||
        kecamatan.includes(q) ||
        alamat.includes(q) ||
        (Array.isArray(sh.fasilitas) &&
          sh.fasilitas.some((f) => f && f.toLowerCase().includes(q)));

      const matchDistrict =
        filterDistrict === "SEMUA" ||
        kecamatan === filterDistrict.toLowerCase();

      const matchStatus = filterStatus === "SEMUA" || sh.status === filterStatus;

      return matchSearch && matchDistrict && matchStatus;
    });
  }, [shelters, search, filterDistrict, filterStatus]);

  // Reset page ke 1 jika filter atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDistrict, filterStatus]);

  // Kalkulasi Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Pastikan currentPage tidak melebihi totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Algoritma Penomoran Halaman dengan Ellipsis Pintar
  const getPageNumbers = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, "...", total];
    }
    if (current >= total - 2) {
      return [1, "...", total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  // Pemotong teks fasilitas agar padat & fungsional
  const formatFacilityName = (fac: string): string => {
    const lower = fac.toLowerCase();
    if (lower.includes("aula")) return "Aula";
    if (lower.includes("dapur")) return "Dapur Umum";
    if (lower.includes("toilet") || lower.includes("wc") || lower.includes("kamar mandi")) return "Toilet";
    if (lower.includes("genset") || lower.includes("listrik")) return "Genset";
    if (lower.includes("medis") || lower.includes("puskesmas") || lower.includes("dokter")) return "Pos Medis";
    if (lower.includes("ambulans")) return "Ambulans";
    if (lower.includes("laktasi") || lower.includes("bayi") || lower.includes("balita")) return "Ruang Anak";
    if (lower.includes("logistik") || lower.includes("sembako")) return "Logistik";
    if (lower.includes("air")) return "Air Bersih";
    return fac.replace(/\s+\d+.*$/, "").replace(/\s+(luas|lengkap|siaga|darurat|kemensos)$/i, "");
  };

  const getFacilityIcon = (fac: string) => {
    const lower = fac.toLowerCase();
    if (lower.includes("dapur") || lower.includes("logistik") || lower.includes("air")) return Utensils;
    if (
      lower.includes("medis") ||
      lower.includes("puskesmas") ||
      lower.includes("dokter") ||
      lower.includes("ambulans")
    )
      return Stethoscope;
    if (lower.includes("balita") || lower.includes("lansia") || lower.includes("anak") || lower.includes("bayi"))
      return Baby;
    if (lower.includes("genset") || lower.includes("listrik")) return Zap;
    return ShieldCheck;
  };

  return (
    <div className="space-y-6 text-left">
      {/* DUA CARD TERPISAH (FULL ROUNDED): CARD SEARCH (KIRI) & TOMBOL FILTER (KANAN) */}
      <section className={`relative ${isFilterOpen ? "z-20" : "z-0"}`} ref={filterDropdownRef}>
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
          </button>
        </div>

        {/* DROPDOWN VIEW MENGAMBANG DI BAWAH */}
        {isFilterOpen && (
          <div className="absolute top-full right-0 w-full sm:w-[420px] mt-2.5 bg-white rounded-3xl border border-[#D5E4E0] p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 z-30">
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
        {isLoading && shelters.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-6 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-6 w-56 bg-slate-200 rounded" />
                  <div className="h-3 w-40 bg-slate-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full" />
              <div className="flex justify-between pt-2">
                <div className="h-8 w-28 bg-slate-100 rounded-xl" />
                <div className="h-8 w-32 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="md:col-span-2 p-12 rounded-3xl bg-white border border-[#D5E4E0] text-center space-y-2">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-base font-bold text-gray-700">Posko Tidak Ditemukan</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Tidak ada posko yang cocok dengan kata kunci &quot;{search}&quot; atau filter yang dipilih. Silakan reset filter pencarian Anda.
            </p>
          </div>
        ) : (
          paginatedItems.map((sh) => {
            const percent = Math.round((sh.terisi / sh.kapasitas) * 100);
            const photos =
              sh.fotos && sh.fotos.length > 0
                ? sh.fotos
                : sh.photos && sh.photos.length > 0
                ? sh.photos
                : [sh.foto || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80"];

            return (
              <div
                key={sh.id}
                className="bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-6 shadow-xs hover:border-[#38746D] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Header Posko & Status Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-extrabold text-[#38746D] uppercase tracking-wider bg-[#EEF5F3] px-2 py-0.5 rounded-md border border-[#38746D]/20">
                          Kec. {sh.kecamatan}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[11px] font-semibold text-[#4B635F]">
                          1.2 km
                        </span>
                      </div>
                      <Link
                        href={`/warga/evakuasi?shelterId=${sh.id}&lat=${sh.lat}&lng=${sh.lng}`}
                        className="group/title block"
                        title="Klik untuk melihat detail lengkap posko di Peta Evakuasi"
                      >
                        <h3 className="font-extrabold text-base sm:text-lg text-[#132422] group-hover/title:text-[#38746D] transition-colors leading-snug">
                          {sh.nama}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#718783] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                        <span className="truncate">{sh.alamat}</span>
                      </p>

                      {/* Badges Ringkas: Bebas Banjir & Elevasi */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20">
                          <ShieldCheck className="w-3 h-3 text-[#38746D] shrink-0" />
                          Bebas Banjir
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-[#F8FAF9] text-[#4B635F] border border-[#D5E4E0]">
                          +2.5m dpl
                        </span>
                        <Link
                          href={`/warga/evakuasi?shelterId=${sh.id}&lat=${sh.lat}&lng=${sh.lng}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#E8F1EE] text-[#38746D] hover:bg-[#38746D] hover:text-white transition-colors"
                          title="Buka panel detail posko di Peta Evakuasi"
                        >
                          Lihat Detail di Peta &rarr;
                        </Link>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold shrink-0 ${
                        sh.status === "TERSEDIA"
                          ? "bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/30"
                          : "bg-amber-50 text-amber-900 border border-amber-200"
                      }`}
                    >
                      {sh.status === "TERSEDIA" ? "✓ Tersedia" : "⚠ Hampir Penuh"}
                    </span>
                  </div>

                  {/* Foto Posko (Galeri Dinamis: 1, 2, atau >= 3 Foto persis seperti di Petugas) */}
                  {photos.length === 1 && (
                    <div
                      onClick={() => setSelectedLightbox({ title: sh.nama, photos, index: 0 })}
                      className="w-full h-40 sm:h-44 rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] my-2 cursor-pointer relative group"
                    >
                      <img
                        src={photos[0]}
                        alt={sh.nama}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 text-xs font-semibold backdrop-blur-xs">
                          <Eye className="w-4 h-4" />
                          Lihat Foto
                        </span>
                      </div>
                    </div>
                  )}

                  {photos.length === 2 && (
                    <div className="grid grid-cols-2 gap-2 h-40 sm:h-44 my-2 w-full">
                      <div
                        onClick={() => setSelectedLightbox({ title: sh.nama, photos, index: 0 })}
                        className="h-full w-full overflow-hidden rounded-2xl bg-slate-100 border border-[#D5E4E0] relative cursor-pointer group"
                      >
                        <img
                          src={photos[0]}
                          alt={`${sh.nama} 1`}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>
                      <div
                        onClick={() => setSelectedLightbox({ title: sh.nama, photos, index: 1 })}
                        className="h-full w-full overflow-hidden rounded-2xl bg-slate-100 border border-[#D5E4E0] relative cursor-pointer group"
                      >
                        <img
                          src={photos[1]}
                          alt={`${sh.nama} 2`}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}

                  {photos.length >= 3 && (
                    <div className="grid grid-cols-3 gap-2 h-40 sm:h-44 my-2 w-full">
                      {/* Sisi Kiri: 1 Foto Utama Besar (col-span-2) */}
                      <div
                        onClick={() => setSelectedLightbox({ title: sh.nama, photos, index: 0 })}
                        className="col-span-2 h-full w-full overflow-hidden rounded-2xl bg-slate-100 border border-[#D5E4E0] relative cursor-pointer group"
                      >
                        <img
                          src={photos[0]}
                          alt={sh.nama}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>

                      {/* Sisi Kanan: 2 Foto Kecil Ditumpuk Vertikal */}
                      <div className="col-span-1 grid grid-rows-2 gap-2 h-full w-full min-h-0">
                        <div
                          onClick={() => setSelectedLightbox({ title: sh.nama, photos, index: 1 })}
                          className="h-full w-full overflow-hidden rounded-xl bg-slate-100 border border-[#D5E4E0] relative cursor-pointer group min-h-0"
                        >
                          <img
                            src={photos[1]}
                            alt={`${sh.nama} 2`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div
                          onClick={() => setSelectedLightbox({ title: sh.nama, photos, index: 2 })}
                          className="h-full w-full overflow-hidden rounded-xl bg-slate-100 border border-[#D5E4E0] relative cursor-pointer group min-h-0"
                        >
                          <img
                            src={photos[2]}
                            alt={`${sh.nama} 3`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {photos.length > 3 && (
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center text-white rounded-xl">
                              <span className="text-sm font-extrabold tracking-wide">
                                +{photos.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meter Okupansi Kapasitas */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-bold text-[#132422]">
                      <span>
                        Kapasitas: {sh.terisi} / {sh.kapasitas} Jiwa
                      </span>
                      <span
                        className={
                          percent >= 90
                            ? "text-rose-600"
                            : percent >= 70
                            ? "text-amber-700"
                            : "text-[#38746D]"
                        }
                      >
                        {percent}% Terisi
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
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
                  </div>

                  {/* Fasilitas Posko Ringkas & Netral */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                      Fasilitas Aktif:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sh.fasilitas.map((fac, i) => {
                        const cleanName = formatFacilityName(fac);
                        const Icon = getFacilityIcon(fac);
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 text-[11px] font-medium"
                          >
                            <Icon className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{cleanName}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Card: Tombol Aksi Terstruktur Berhierarki Jelas */}
                <div className="pt-3.5 border-t border-[#E8F1EE] flex items-center gap-2">
                  {/* Tombol Sekunder 1: Telepon */}
                  <a
                    href={`tel:${sh.kontak.telp.replace(/[^0-9]/g, "")}`}
                    onClick={() => trackFeatureInteraction("EMERGENCY_CALL", "Kontak Posko", `Warga menghubungi PJ posko ${sh.nama} (${sh.kontak.telp})`)}
                    className="h-9.5 px-3 rounded-xl border border-[#D5E4E0] bg-white hover:bg-[#F8FAF9] text-[#1D443F] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                    title={`Hubungi Pengelola Posko: ${sh.kontak.pj} (${sh.kontak.telp})`}
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                    <span>Telepon</span>
                  </a>

                  {/* Tombol Sekunder 2: Google Maps (Alternatif Audio Turn-by-Turn) */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${sh.lat},${sh.lng}`}
                    onClick={() => trackFeatureInteraction("GPS_ROUTE", "Navigasi Google Maps", `Warga membuka rute Google Maps ke ${sh.nama} (${sh.kecamatan})`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9.5 px-3 rounded-xl border border-[#D5E4E0] bg-white hover:bg-[#EEF5F3] text-[#1D443F] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                    title="Buka Navigasi Suara Belokan di Google Maps"
                  >
                    <span>GMaps</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>

                  {/* Tombol Utama (Primary): Rute Evakuasi Bebas Banjir DERMAYU (Flex-1, Proporsi Terbesar, Hijau Global) */}
                  <Link
                    href={`/warga/evakuasi?shelterId=${sh.id}&lat=${sh.lat}&lng=${sh.lng}`}
                    onClick={() => trackFeatureInteraction("GPS_ROUTE", "Peta Rute Bebas Banjir", `Warga membuka rute evakuasi peta DERMAYU ke ${sh.nama} (${sh.kecamatan})`)}
                    className="h-9.5 flex-1 px-4 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    title="Buka Navigasi Rute Bebas Banjir di Peta Evakuasi DERMAYU"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#A4C6C1] shrink-0" />
                    <span>Rute Evakuasi</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* 4. KOMPONEN PAGINATION MODERN (Pengganti Tombol Load More) */}
      {filtered.length > 0 && (
        <div className="pt-6 pb-8 border-t border-[#E8F1EE] flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          {/* Info Status Item */}
          <div className="text-xs text-[#4B635F] font-medium order-2 sm:order-1">
            Menampilkan <strong className="text-[#132422]">{startIndex + 1}</strong> -{" "}
            <strong className="text-[#132422]">
              {Math.min(filtered.length, startIndex + itemsPerPage)}
            </strong>{" "}
            dari <strong className="text-[#132422]">{filtered.length}</strong> posko aman
          </div>

          {/* Pagination Navigation Control */}
          <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
            {/* Tombol Prev Lingkaran Solid */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="w-10 h-10 rounded-full bg-[#38746D] text-white flex items-center justify-center hover:bg-[#24544E] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs active:scale-95 cursor-pointer shrink-0"
              aria-label="Halaman Sebelumnya"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Deretan Angka Halaman dengan Indikator Border Hijau Aktif */}
            <div className="flex items-center bg-[#F8FAF9] border border-[#D5E4E0] rounded-full px-2 py-1 gap-1">
              {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                if (p === "...") {
                  return (
                    <span
                      key={`dots-${idx}`}
                      className="w-9 h-9 flex items-center justify-center text-gray-400 font-bold text-xs select-none"
                    >
                      ...
                    </span>
                  );
                }
                const pageNum = p as number;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition cursor-pointer ${
                      isActive
                        ? "border-2 border-[#38746D] text-[#38746D] font-black bg-white shadow-xs"
                        : "text-gray-600 hover:text-[#38746D] font-semibold hover:bg-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Tombol Next Lingkaran Solid */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="w-10 h-10 rounded-full bg-[#38746D] text-white flex items-center justify-center hover:bg-[#24544E] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs active:scale-95 cursor-pointer shrink-0"
              aria-label="Halaman Berikutnya"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Items Per Page Dropdown Selector */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#4B635F] order-3">
            <span>Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 px-2.5 rounded-xl border border-[#D5E4E0] bg-white text-xs font-bold text-[#1D443F] outline-none focus:border-[#38746D] transition cursor-pointer shadow-2xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-gray-400 hidden lg:inline">/ hal</span>
          </div>
        </div>
      )}

      {/* Lightbox Modal Foto Dokumentasi Posko (Persis seperti di Petugas) */}
      {selectedLightbox && (
        <div
          onClick={() => setSelectedLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6"
        >
          {/* Header Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between pb-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-bold text-base sm:text-lg truncate max-w-md sm:max-w-xl">
                {selectedLightbox.title}
              </h3>
              <p className="text-xs text-gray-400">
                Foto {selectedLightbox.index + 1} dari {selectedLightbox.photos.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLightbox(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Image View */}
          <div
            className="relative max-w-5xl max-h-[75vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedLightbox.photos[selectedLightbox.index]}
              alt={`Dokumentasi ${selectedLightbox.index + 1}`}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            {selectedLightbox.photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLightbox((prev) =>
                      prev
                        ? {
                            ...prev,
                            index: prev.index > 0 ? prev.index - 1 : prev.photos.length - 1,
                          }
                        : null
                    );
                  }}
                  className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition cursor-pointer shadow-lg border border-white/20"
                  title="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLightbox((prev) =>
                      prev
                        ? {
                            ...prev,
                            index: prev.index < prev.photos.length - 1 ? prev.index + 1 : 0,
                          }
                        : null
                    );
                  }}
                  className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition cursor-pointer shadow-lg border border-white/20"
                  title="Foto Selanjutnya"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {selectedLightbox.photos.length > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto max-w-5xl pt-4 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedLightbox.photos.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setSelectedLightbox((prev) => (prev ? { ...prev, index: idx } : null))
                  }
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                    selectedLightbox.index === idx
                      ? "border-[#88BDB6] ring-2 ring-[#88BDB6]/50 scale-105"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={p} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
