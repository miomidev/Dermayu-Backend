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

import {
  type ReportStatus,
  type CitizenReportItem,
  INITIAL_CITIZEN_REPORTS,
} from "@/data/citizenReports";

export type { ReportStatus, CitizenReportItem };
export { INITIAL_CITIZEN_REPORTS };

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
  const ITEMS_PER_PAGE = 4;

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

      {/* Daftar Card Aduan Warga: 1 Kolom Mobile, 2 Kolom di Web / Tablet Landscape */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
          {paginatedReports.map((item) => {
            const statusStyle = STATUS_CONFIG[item.status] || {
              dotClass: "bg-gray-400",
              badgeClass: "bg-gray-50 border-gray-200 text-gray-700",
              label: item.status,
            };

            return (
              <div
                key={`feed-${item.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D5E4E0] hover:border-[#88BDB6] transition-all flex flex-col justify-between space-y-3.5 shadow-2xs h-full"
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
                    className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group cursor-pointer shrink-0"
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
                    {(item.aiConfidence <= 1 ? item.aiConfidence * 100 : item.aiConfidence).toFixed(0)}% Valid
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
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 mt-auto">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSimilar(item.id)}
                      title="Terdampak Juga"
                      className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        item.isUpvoted
                          ? "bg-[#38746D] text-white shadow-sm"
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
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
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
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-[#4B635F] hover:text-[#132422] hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#38746D]" />
                      <span>
                        {copiedReportId === item.id ? "Tautan Disalin!" : "Bagikan"}
                      </span>
                    </button>
                  </div>

                  <Link
                    href={`/warga/evakuasi?reportId=${item.id}&lat=${item.lat}&lng=${item.lng}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1D443F] hover:bg-[#2A5852] text-white text-xs font-black shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer ml-auto shrink-0"
                  >
                    <MapPin className="w-4 h-4 text-[#88BDB6] shrink-0" />
                    <span>Buka di Peta</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#88BDB6] shrink-0 ml-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
