"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  PhoneCall,
  Navigation,
  CheckCircle2,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  Utensils,
  Stethoscope,
  Baby,
  Zap,
  Compass,
  AlertTriangle,
  Bed,
  RefreshCw,
  X,
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

  const shelters: ShelterItem[] = [
    {
      id: "sh-1",
      name: "Balai Desa Eretan Wetan",
      location: "Jl. Raya Pantura No. 45",
      district: "Kandanghaur",
      distance: "850 m (±4–6 menit jalan kaki)",
      elevation: "+1.8m dpl (Tinggi Bebas Rob)",
      accessRoad: "Akses Tanggul Nelayan Barat (Aspal Kering)",
      capacityTotal: 250,
      capacityFilled: 185,
      facilities: [
        "Dapur Umum Tagana",
        "Posko Medis Puskesmas",
        "Ruang Balita & Lansia",
        "Genset Cadangan 5KVA",
      ],
      contactPerson: "Bpk. Mulyadi (Kuwu)",
      contactPhone: "0813-8822-1920",
      status: "TERSEDIA",
      notes: "Suplai beras dan air bersih tangki PDAM mencukupi untuk 3 hari ke depan.",
      lat: -6.346,
      lng: 108.1195,
    },
    {
      id: "sh-2",
      name: "GOR Mini Kandanghaur",
      location: "Jl. Olahraga Blok Barat No. 12",
      district: "Kandanghaur",
      distance: "1.8 km (±8 menit kendaraan)",
      elevation: "+2.2m dpl (Titik Kumpul Utama)",
      accessRoad: "By-Pass Lingkar Selatan Pantura (Kering)",
      capacityTotal: 500,
      capacityFilled: 310,
      facilities: [
        "Aula Terbuka Luas",
        "Sanitasi MCK (8 Unit)",
        "Stok Matras & Selimut",
        "Tenda Pleton BNPB",
      ],
      contactPerson: "Ibu Ratna (Relawan Tagana)",
      contactPhone: "0821-4433-2100",
      status: "TERSEDIA",
      notes: "Titik evakuasi utama kendaraan roda 4 dan penerimaan bantuan logistik darurat.",
      lat: -6.349,
      lng: 108.125,
    },
    {
      id: "sh-3",
      name: "SMP Negeri 1 Cantigi",
      location: "Jl. Ki Hajar Dewantara No. 04",
      district: "Cantigi",
      distance: "3.2 km",
      elevation: "+1.6m dpl (Lantai 2 Aman)",
      accessRoad: "Jalur Tanggul Primer Saluran Induk",
      capacityTotal: 200,
      capacityFilled: 190,
      facilities: [
        "Ruang Kelas Tidur",
        "Dokter & Perawat Puskesmas Siaga",
        "Stok Air Minum Galon",
      ],
      contactPerson: "Pak Hendra (Satlak Cantigi)",
      contactPhone: "0852-7711-9022",
      status: "HAMPIR_PENUH",
      notes: "Sisa kuota tinggal 10 tempat tidur lagi, pengungsi baru diarahkan ke Balai Desa Pasekan.",
      lat: -6.2842,
      lng: 108.2635,
    },
    {
      id: "sh-4",
      name: "Aula Kantor Kecamatan Losarang",
      location: "Jl. Raya Pantura Losarang KM 68",
      district: "Losarang",
      distance: "4.5 km",
      elevation: "+2.5m dpl (Bebas Banjir)",
      accessRoad: "Jalur Arteri Pantura Bebas Genangan",
      capacityTotal: 350,
      capacityFilled: 140,
      facilities: [
        "Posko Logistik PMI",
        "Ambulans Siaga 24 Jam",
        "Dapur Umum Kemensos",
        "Genset Cadangan 10KVA",
      ],
      contactPerson: "Drs. H. Suwandi (Camat)",
      contactPhone: "0812-3344-5566",
      status: "TERSEDIA",
      notes: "Lokasi aman di pinggir jalur arteri dengan suplai listrik dan air PDAM stabil.",
      lat: -6.402,
      lng: 108.165,
    },
    {
      id: "sh-5",
      name: "Balai Desa Pasekan",
      location: "Jl. Raya Pasekan No. 18",
      district: "Pasekan",
      distance: "5.1 km",
      elevation: "+1.7m dpl",
      accessRoad: "Jalur Saluran Irigasi Barat",
      capacityTotal: 200,
      capacityFilled: 85,
      facilities: [
        "Dapur Warga Mandiri",
        "Bidan Desa Siaga",
        "Ruang Balita & Anak",
        "Penampungan Air Bersih",
      ],
      contactPerson: "Pak Carma (Satgas Desa)",
      contactPhone: "0877-2233-4411",
      status: "TERSEDIA",
      notes: "Posko penampungan alternatif bagi warga pesisir Cantigi dan Pasekan.",
      lat: -6.315,
      lng: 108.295,
    },
  ];

  const DISTRICTS = ["SEMUA", "Kandanghaur", "Cantigi", "Losarang", "Pasekan"];

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

  const totalKapasitas = shelters.reduce((acc, cur) => acc + cur.capacityTotal, 0);
  const totalTerisi = shelters.reduce((acc, cur) => acc + cur.capacityFilled, 0);
  const totalSisa = totalKapasitas - totalTerisi;
  const persentaseOkupansi = Math.round((totalTerisi / totalKapasitas) * 100);

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
      {/* 1. METRIK RINGKASAN POSKO KABUPATEN INDRAMAYU */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Kapasitas */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B635F] uppercase tracking-wider">
              Total Kapasitas Terdata
            </span>
            <Building2 className="w-4 h-4 text-[#38746D]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#132422]">
            {totalKapasitas} <span className="text-sm font-bold text-gray-500">Jiwa</span>
          </p>
          <p className="text-xs text-[#718783]">
            Tersebar di {shelters.length} posko evakuasi aktif BPBD Indramayu
          </p>
        </div>

        {/* Warga Tertampung */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B635F] uppercase tracking-wider">
              Warga Mengungsi
            </span>
            <Users className="w-4 h-4 text-[#38746D]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#1D443F]">
            {totalTerisi} <span className="text-sm font-bold text-gray-500">Jiwa</span>
          </p>
          <p className="text-xs text-[#718783]">
            Tingkat okupansi rata-rata <strong>{persentaseOkupansi}%</strong>
          </p>
        </div>

        {/* Sisa Kuota Bebas Biaya */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B635F] uppercase tracking-wider">
              Sisa Kuota Tempat Tidur
            </span>
            <Bed className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">
            {totalSisa} <span className="text-sm font-bold text-gray-500">Tempat</span>
          </p>
          <p className="text-xs text-emerald-800 font-semibold">
            Bebas biaya • Suplai logistik makan & medis terjamin
          </p>
        </div>
      </section>

      {/* 2. FILTER & PENCARIAN TERPADU */}
      <section className="bg-white rounded-3xl border border-[#D5E4E0] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Input Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama posko, kecamatan, desa, atau fasilitas (misal: genset, balita)..."
              className="w-full h-11 pl-10 pr-4 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
            {["SEMUA", "TERSEDIA", "HAMPIR_PENUH"].map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  filterStatus === st
                    ? "bg-[#1D443F] text-white shadow-xs"
                    : "bg-[#F8FAF9] text-[#4B635F] border border-[#D5E4E0] hover:bg-gray-100"
                }`}
              >
                {st === "SEMUA"
                  ? "Semua Status"
                  : st === "TERSEDIA"
                  ? "✓ Tersedia"
                  : "⚠ Hampir Penuh"}
              </button>
            ))}
          </div>
        </div>

        {/* District Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-gray-100 pb-0.5 text-xs">
          <span className="text-[#718783] text-[11px] font-bold uppercase tracking-wider shrink-0 mr-1">
            Wilayah:
          </span>
          {DISTRICTS.map((dist) => (
            <button
              type="button"
              key={dist}
              onClick={() => setFilterDistrict(dist)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 text-[11px] ${
                filterDistrict === dist
                  ? "bg-[#EEF5F3] text-[#1D443F] border border-[#38746D] shadow-2xs"
                  : "bg-[#F8FAF9] text-[#4B635F] border border-[#D5E4E0] hover:bg-gray-100"
              }`}
            >
              {dist === "SEMUA" ? "Semua Wilayah" : `Kec. ${dist}`}
            </button>
          ))}

          {(search || filterDistrict !== "SEMUA" || filterStatus !== "SEMUA") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterDistrict("SEMUA");
                setFilterStatus("SEMUA");
              }}
              className="text-[11px] font-bold text-rose-600 hover:underline shrink-0 ml-2 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
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
          filtered.map((sh) => {
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
                            : "bg-[#1D443F]"
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D443F] hover:bg-[#24544E] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
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
    </div>
  );
}
