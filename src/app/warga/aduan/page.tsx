"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  PlusCircle,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Waves,
  ThumbsUp,
  Share2,
  Eye,
  X,
  Users,
} from "lucide-react";

export type ReportStatus = "PENANGANAN" | "DIVERIFIKASI" | "SELESAI";

export interface CitizenReportItem {
  id: string;
  authorName: string;
  authorRole: "Warga" | "Relawan Tagana" | "Aparat Desa";
  authorVillage: string;
  title: string;
  description: string;
  location: string;
  waterLevelText: string;
  waterDepthCm: number;
  timeAgo: string;
  photoUrl: string;
  aiConfidence: number;
  status: ReportStatus;
  statusNote: string;
  similarCount: number;
  isUpvoted?: boolean;
  lat: number;
  lng: number;
}

const STATUS_CONFIG: Record<
  ReportStatus,
  {
    dotClass: string;
    badgeClass: string;
    label: string;
  }
> = {
  PENANGANAN: {
    dotClass: "bg-sky-500 animate-pulse",
    badgeClass: "bg-sky-50 border-sky-200 text-sky-900",
    label: "Regu SAR Menuju Lokasi",
  },
  DIVERIFIKASI: {
    dotClass: "bg-emerald-500 animate-pulse",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-900",
    label: "Terverifikasi Siaga Posko",
  },
  SELESAI: {
    dotClass: "bg-teal-600",
    badgeClass: "bg-teal-50 border-teal-200 text-teal-900",
    label: "Tindakan Lapangan Selesai",
  },
};

const INITIAL_CITIZEN_REPORTS: CitizenReportItem[] = [
  {
    id: "DMY-PUB-01",
    authorName: "Pak Warno",
    authorRole: "Warga",
    authorVillage: "Eretan Wetan, Kandanghaur",
    title: "Air pasang rob laut rendam jalan pemukiman nelayan",
    description:
      "Air pasang rob mulai naik sejak pukul 11 siang, akses jalan utama menuju TPI tergenang setinggi lutut orang dewasa.",
    location: "Blok Karanganyar RT 04 / RW 02, Eretan Wetan",
    waterLevelText: "Setinggi Lutut (55 cm)",
    waterDepthCm: 55,
    timeAgo: "15m lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1534862262637-373c120dcbcc?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.94,
    status: "PENANGANAN",
    statusNote:
      "Regu SAR Pos Eretan bersama 1 perahu karet LCR sedang bergerak evakuasi warga rentan.",
    similarCount: 14,
    lat: -6.3475,
    lng: 108.1189,
  },
  {
    id: "DMY-PUB-02",
    authorName: "Ibu Nur Hasanah",
    authorRole: "Warga",
    authorVillage: "Cantigi Kulon, Cantigi",
    title: "Rembesan tanggul tanah saluran tambak mendekati pemukiman",
    description:
      "Debit air pasang menekan tanggul tanah pekarangan tambak ikan, warga waspada potensi limpasan puncak jam 3 sore.",
    location: "Blok Tanggul RT 02 / RW 01, Cantigi Kulon",
    waterLevelText: "Semata Kaki (30 cm)",
    waterDepthCm: 30,
    timeAgo: "45m lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1672559987522-897ef4612604?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.92,
    status: "DIVERIFIKASI",
    statusNote:
      "Posko menyiapkan 150 karung pasir bronjong darurat untuk pengamanan darurat tanggul.",
    similarCount: 8,
    lat: -6.2842,
    lng: 108.2635,
  },
  {
    id: "DMY-PUB-03",
    authorName: "Kang Didi",
    authorRole: "Relawan Tagana",
    authorVillage: "Parean Girang, Kandanghaur",
    title: "Drainase pembuang sekunder tersumbat eceng gondok & sampah ranting",
    description:
      "Aliran air ke muara tersendat akibat tumpukan ranting kayu di bawah jembatan penghubung antar dusun.",
    location: "Jl. Muara Lama KM 2, Parean Girang",
    waterLevelText: "Genangan 40 cm",
    waterDepthCm: 40,
    timeAgo: "1j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.89,
    status: "PENANGANAN",
    statusNote:
      "Satgas Dinas PUPR Indramayu bersama relawan telah mulai pembersihan pintu air saluran pembuang.",
    similarCount: 6,
    lat: -6.368,
    lng: 108.092,
  },
  {
    id: "DMY-PUB-04",
    authorName: "Bpk. Sutrisno",
    authorRole: "Aparat Desa",
    authorVillage: "Karangsong, Indramayu",
    title: "Limpasan gelombang pasang rob di area dermaga perahu",
    description:
      "Air laut meluap tipis ke bibir dermaga kapal nelayan, pompa sedot darurat telah diaktifkan untuk menjaga area tambatan.",
    location: "Dermaga Muara Karangsong, Indramayu",
    waterLevelText: "Semata Kaki (25 cm)",
    waterDepthCm: 25,
    timeAgo: "2j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1741110539426-fce3268c3c0d?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.95,
    status: "SELESAI",
    statusNote:
      "Pompa submersible menyala normal, genangan air berangsur surut kembali ke alur muara sungai.",
    similarCount: 19,
    lat: -6.315,
    lng: 108.358,
  },
  {
    id: "DMY-PUB-05",
    authorName: "Mang Casmadi",
    authorRole: "Warga",
    authorVillage: "Pasekan, Indramayu",
    title: "Jalan penghubung desa tergenang air pasang muara 35 cm",
    description:
      "Akses jalan antar blok di Pasekan tergenang air pasang sejak siang. Kendaraan roda dua dialihkan lewat tanggul timur.",
    location: "Blok Karang Baru RT 02 / RW 01, Pasekan",
    waterLevelText: "Semata Kaki - Betis (35 cm)",
    waterDepthCm: 35,
    timeAgo: "3j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.93,
    status: "DIVERIFIKASI",
    statusNote:
      "Aparat desa bersama Tagana telah memasang rambu peringatan genangan di ujung jembatan.",
    similarCount: 11,
    lat: -6.298,
    lng: 108.312,
  },
  {
    id: "DMY-PUB-06",
    authorName: "Kuwu Waryono",
    authorRole: "Aparat Desa",
    authorVillage: "Cantigi Kulon, Cantigi",
    title: "Penguatan tanggul darurat muara saluran sekunder selesai",
    description:
      "Alhamdulillah kerja bakti penguatan tanggul darurat di muara saluran sekunder telah selesai bersama pemuda Karang Taruna dan relawan.",
    location: "Saluran Sekunder Blok 4, Cantigi Kulon",
    waterLevelText: "Aman Terkendali (15 cm)",
    waterDepthCm: 15,
    timeAgo: "4j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.96,
    status: "SELESAI",
    statusNote:
      "Pintu air sekunder ditutup manual, rembesan telah dibendung dengan 200 karung pasir.",
    similarCount: 24,
    lat: -6.289,
    lng: 108.268,
  },
  {
    id: "DMY-PUB-07",
    authorName: "Hj. Mutmainah",
    authorRole: "Warga",
    authorVillage: "Limbangan, Juntinyuat",
    title: "Gelombang pasang rob meluap ke pekarangan pengolahan ikan asin",
    description:
      "Air laut naik ke area jemuran ikan asin warga pesisir Limbangan, warga mengamankan stok garam dan ikan olahan ke tempat lebih tinggi.",
    location: "Sentra Ikan Asin RT 05 / RW 02, Limbangan",
    waterLevelText: "Betis Dewasa (40 cm)",
    waterDepthCm: 40,
    timeAgo: "5j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1534862262637-373c120dcbcc?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.91,
    status: "PENANGANAN",
    statusNote:
      "Regu evakuasi Posko Juntinyuat telah meninjau lokasi dan membantu pemindahan perabotan.",
    similarCount: 15,
    lat: -6.412,
    lng: 108.455,
  },
  {
    id: "DMY-PUB-08",
    authorName: "Relawan Posko Tagana",
    authorRole: "Relawan Tagana",
    authorVillage: "Ilir, Kandanghaur",
    title: "Dapur umum mandiri membutuhkan tambahan selimut dan air galon",
    description:
      "Dapur umum di Balai Desa Ilir menyiapkan 300 paket nasi bungkus untuk warga terdampak rob di pesisir utara.",
    location: "Posko Dapur Umum Balai Desa Ilir, Kandanghaur",
    waterLevelText: "Bebas Genangan",
    waterDepthCm: 0,
    timeAgo: "6j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1672559987522-897ef4612604?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.97,
    status: "PENANGANAN",
    statusNote:
      "Logistik beras dan mie instan telah tiba dari gudang BPBD Kabupaten Indramayu.",
    similarCount: 32,
    lat: -6.355,
    lng: 108.132,
  },
];

const REGION_FILTERS = [
  { code: "ALL", label: "Semua Wilayah" },
  { code: "Kandanghaur", label: "Kandanghaur" },
  { code: "Cantigi", label: "Cantigi" },
  { code: "Indramayu", label: "Indramayu Kota" },
  { code: "Pasekan", label: "Pasekan" },
  { code: "Juntinyuat", label: "Juntinyuat" },
];

export default function WargaAduanPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 3;

  const [reports, setReports] = useState<CitizenReportItem[]>(INITIAL_CITIZEN_REPORTS);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [copiedReportId, setCopiedReportId] = useState<string | null>(null);

  const handleToggleSimilar = (id: string) => {
    setReports((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isUp = !item.isUpvoted;
          return {
            ...item,
            isUpvoted: isUp,
            similarCount: item.similarCount + (isUp ? 1 : -1),
          };
        }
        return item;
      })
    );
  };

  const handleShareReport = (item: CitizenReportItem) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `[Aduan Warga DERMAYU]\n${item.authorName} (${item.authorVillage}):\n"${item.title}"\nLokasi: ${item.location}`
      );
      setCopiedReportId(item.id);
      setTimeout(() => setCopiedReportId(null), 2500);
    }
  };

  const handleSelectRegion = (code: string) => {
    setSelectedRegion(code);
    setCurrentPage(1);
  };

  const filtered = reports.filter((item) => {
    if (selectedRegion === "ALL") return true;
    return (
      item.authorVillage.toLowerCase().includes(selectedRegion.toLowerCase()) ||
      item.location.toLowerCase().includes(selectedRegion.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Algoritma Penomoran Halaman dengan Ellipsis Pintar (Persis seperti Halaman Posko)
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

  return (
    <div className="space-y-6 text-left">
      {/* Header Bar & Quick CTA */}
      <section className="bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-[#132422] flex items-center gap-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#38746D]" />
            Pelacakan Status Aduan &amp; Tiket Darurat
          </h2>
          <p className="text-xs text-[#4B635F] mt-0.5">
            Pantau perkembangan penanganan tim SAR dan regu evakuasi BPBD Indramayu secara langsung.
          </p>
        </div>

        <Link
          href="/warga/lapor"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Kirim Aduan Baru</span>
        </Link>
      </section>

      {/* Filter Tab Berdasarkan Daerah / Wilayah */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap">
        {REGION_FILTERS.map((reg) => {
          const count =
            reg.code === "ALL"
              ? reports.length
              : reports.filter(
                  (r) =>
                    r.authorVillage.toLowerCase().includes(reg.code.toLowerCase()) ||
                    r.location.toLowerCase().includes(reg.code.toLowerCase())
                ).length;

          return (
            <button
              type="button"
              key={reg.code}
              onClick={() => handleSelectRegion(reg.code)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                selectedRegion === reg.code
                  ? "bg-[#38746D] text-white shadow-xs"
                  : "bg-white text-[#4B635F] border border-[#D5E4E0] hover:bg-gray-50"
              }`}
            >
              <span>{reg.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  selectedRegion === reg.code
                    ? "bg-white/20 text-white"
                    : "bg-[#EEF5F3] text-[#1D443F]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Daftar Card Aduan Warga (Tampilan Serasi Penuh dengan Halaman Lapor) */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-[#D5E4E0] text-center space-y-2">
            <p className="text-sm font-bold text-gray-500">Tidak ada aduan warga di wilayah ini.</p>
            <button
              type="button"
              onClick={() => handleSelectRegion("ALL")}
              className="text-xs font-bold text-[#38746D] hover:underline cursor-pointer"
            >
              Tampilkan Semua Wilayah
            </button>
          </div>
        ) : (
          paginatedReports.map((item) => {
            const statusStyle = STATUS_CONFIG[item.status] || {
              dotClass: "bg-gray-400",
              badgeClass: "bg-gray-50 border-gray-200 text-gray-700",
              label: item.status,
            };

            return (
              <div
                key={`feed-${item.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D5E4E0] hover:border-[#88BDB6] transition-all space-y-3.5 shadow-2xs"
              >
                {/* Header Card: Profil Pelapor & Waktu Sejajar di Kanan Atas */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#1D443F] text-[#88BDB6] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
                      {item.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-[#132422] truncate block">
                        {item.authorName}
                      </span>
                      <p className="text-[11px] text-[#718783] flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
                        <span className="truncate">{item.authorVillage}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-500 flex items-center gap-1 shrink-0 font-medium bg-[#F8FAF9] px-2.5 py-1 rounded-lg border border-gray-200">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {item.timeAgo}
                  </span>
                </div>

                {/* Judul & Keterangan Aduan */}
                <div className="space-y-1">
                  <Link
                    href={`/warga/evakuasi?reportId=${item.id}&lat=${item.lat}&lng=${item.lng}`}
                    className="group/title block hover:underline"
                  >
                    <h5 className="text-xs sm:text-sm font-bold text-[#132422] group-hover/title:text-[#38746D] transition-colors leading-snug">
                      {item.title}
                    </h5>
                  </Link>
                  <p className="text-xs text-[#4B635F] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Foto Bukti Lebar Penuh (Full-Width Image) */}
                {item.photoUrl && (
                  <div
                    onClick={() =>
                      setPreviewImage({ url: item.photoUrl, title: item.title })
                    }
                    className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group cursor-pointer"
                  >
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 text-xs font-semibold backdrop-blur-xs">
                        <Eye className="w-4 h-4" />
                        Perbesar Foto
                      </span>
                    </div>
                  </div>
                )}

                {/* Elemen Metadata (Ketinggian Air & Validasi AI) */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-bold">
                    <Waves className="w-3.5 h-3.5 text-sky-600" />
                    {item.waterLevelText}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {(item.aiConfidence * 100).toFixed(0)}% Valid
                  </span>
                </div>

                {/* Status Penanganan & Catatan Petugas */}
                <div className="pt-2.5 border-t border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusStyle.dotClass}`} />
                      <span className="text-[11px] font-bold text-[#132422]">
                        {statusStyle.label}
                      </span>
                    </div>
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${statusStyle.badgeClass}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed bg-[#F8FAF9] p-2.5 rounded-xl border border-gray-100">
                    {item.statusNote}
                  </p>
                </div>

                {/* Tombol Aksi & Interaksi */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSimilar(item.id)}
                      title="Terdampak Juga"
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        item.isUpvoted
                          ? "bg-[#38746D] text-white shadow-2xs"
                          : "bg-[#F8FAF9] hover:bg-emerald-50 text-[#1D443F] border border-[#D5E4E0]"
                      }`}
                    >
                      <ThumbsUp
                        className={`w-3.5 h-3.5 ${
                          item.isUpvoted ? "text-[#88BDB6]" : "text-[#38746D]"
                        }`}
                      />
                      <span className="hidden sm:inline">Terdampak Juga</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          item.isUpvoted
                            ? "bg-white/20 text-white"
                            : "bg-[#EEF5F3] text-[#1D443F]"
                        }`}
                      >
                        {item.similarCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareReport(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#4B635F] hover:text-[#132422] hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#38746D]" />
                      <span>
                        {copiedReportId === item.id ? "Tautan Disalin!" : "Bagikan"}
                      </span>
                    </button>
                  </div>

                  <Link
                    href={`/warga/evakuasi?reportId=${item.id}&lat=${item.lat}&lng=${item.lng}`}
                    className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#38746D] hover:bg-[#24544E] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer ml-auto"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#88BDB6]" />
                    <span>Buka di Peta</span>
                    <ChevronRight className="w-3 h-3 text-[#88BDB6]" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. KOMPONEN PAGINATION MODERN (Konsisten 100% dengan Halaman Posko) */}
      {filtered.length > 0 && totalPages > 1 && (
        <div className="pt-6 pb-6 border-t border-[#E8F1EE] flex flex-col items-center justify-center gap-3 select-none">
          {/* Pagination Navigation Control */}
          <div className="flex items-center gap-2 sm:gap-3">
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

            {/* Deretan Angka Halaman dengan Kapsul Pembungkus dan Indikator Border Hijau Aktif */}
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

          {/* Info Status Item */}
          <div className="text-xs text-[#4B635F] font-medium text-center">
            Menampilkan <strong className="text-[#132422]">{startIndex + 1}</strong> -{" "}
            <strong className="text-[#132422]">
              {Math.min(filtered.length, startIndex + ITEMS_PER_PAGE)}
            </strong>{" "}
            dari <strong className="text-[#132422]">{filtered.length}</strong> aduan
          </div>
        </div>
      )}

      {/* Modal Preview Gambar Ukuran Penuh */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h4 className="text-sm font-bold text-[#132422] truncate">{previewImage.title}</h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-gray-900 flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
