"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  X,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Compass,
  Radio,
  LifeBuoy,
  Droplets,
  PhoneCall,
  ArrowRight,
  Clock,
  CheckCircle2,
  Activity,
  Users,
  Building2,
  FileText,
  SlidersHorizontal,
  Info,
  HelpCircle,
  Flame,
} from "lucide-react";
import { getActiveSession } from "@/utils/authSession";

interface GuideStep {
  step: number;
  title: string;
  description: string;
}

interface GuideItem {
  id: string;
  category: string;
  title: string;
  tagline: string;
  readTime: string;
  icon: React.ElementType;
  badgeColor: string;
  summary: string;
  steps: GuideStep[];
  callout: {
    type: "tip" | "warning" | "sop";
    title: string;
    text: string;
  };
  actionUrl: string;
  actionText: string;
}

interface BukuPanduanViewProps {
  forcedRole?: "warga" | "petugas";
}

export function BukuPanduanView({ forcedRole }: BukuPanduanViewProps) {
  const session = getActiveSession();
  const detectedRole: "warga" | "petugas" =
    forcedRole ||
    (session?.role === "petugas" ||
    session?.role === "OFFICER" ||
    session?.role === "superadmin" ||
    session?.role === "SUPERADMIN"
      ? "petugas"
      : "warga");
  const [activeRole, setActiveRole] = useState<"warga" | "petugas">(detectedRole);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    "warga-lapor": true,
    "petugas-triage": true,
  });

  // Toggle satu accordion
  const toggleAccordion = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Expand / Collapse semua accordion sekaligus
  const toggleAll = (expand: boolean) => {
    const list = activeRole === "warga" ? WARGA_GUIDES : PETUGAS_GUIDES;
    const newState: Record<string, boolean> = {};
    list.forEach((item) => {
      newState[item.id] = expand;
    });
    setExpandedIds(newState);
  };

  // Daftar Kategori Tab Dinamis
  const categories = useMemo(() => {
    const list = activeRole === "warga" ? WARGA_GUIDES : PETUGAS_GUIDES;
    const cats = Array.from(new Set(list.map((item) => item.category)));
    return ["Semua", ...cats];
  }, [activeRole]);

  // Filter Panduan Berdasarkan Kategori & Pencarian
  const filteredGuides = useMemo(() => {
    const list = activeRole === "warga" ? WARGA_GUIDES : PETUGAS_GUIDES;
    return list.filter((item) => {
      const matchCategory =
        activeCategory === "Semua" || item.category === activeCategory;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inTitle = item.title.toLowerCase().includes(q);
      const inSummary = item.summary.toLowerCase().includes(q);
      const inTagline = item.tagline.toLowerCase().includes(q);
      const inSteps = item.steps.some(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
      const inCallout =
        item.callout.title.toLowerCase().includes(q) ||
        item.callout.text.toLowerCase().includes(q);

      return inTitle || inSummary || inTagline || inSteps || inCallout;
    });
  }, [activeRole, activeCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full text-slate-800">
      {/* ============================================================== */}
      {/* 1. HERO HEADER: JUDUL BUKU PANDUAN SIAGA & ROLE SWITCHER       */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-[#1D443F] via-[#24544E] to-[#132422] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        {/* Dekorasi Aksen Lingkaran Transparan */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              <span>Pusat Edukasi &amp; Standard Operating Procedure (SOP)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Buku Panduan Siaga
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Panduan terpadu penggunaan sistem mitigasi banjir Kabupaten Indramayu.
              Pelajari tata cara pelaporan cepat, pembacaan peringatan telemetri DAS Cimanuk,
              dan rute penyelamatan bebas genangan.
            </p>
          </div>

          {/* Role Mode Indicator & Switcher Tab */}
          <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shrink-0 self-start md:self-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200/80 px-2.5 pb-1">
              Mode Panduan Aktif
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveRole("warga");
                  setActiveCategory("Semua");
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeRole === "warga"
                    ? "bg-white text-[#1D443F] shadow-md"
                    : "text-emerald-100 hover:bg-white/10"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Warga Siaga</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveRole("petugas");
                  setActiveCategory("Semua");
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeRole === "petugas"
                    ? "bg-white text-[#1D443F] shadow-md"
                    : "text-emerald-100 hover:bg-white/10"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Petugas BPBD</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SEARCH BAR & FILTER KATEGORI TABS                           */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D5E4E0] shadow-xs space-y-4">
        {/* Baris Pencarian Cepat */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari panduan ${
                activeRole === "warga" ? "lapor, rute, posko, atau cuaca" : "triage, telemetri, posko, atau SAR"
              }...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#38746D]/30 focus:border-[#38746D] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="px-3 py-2 text-xs font-semibold text-[#38746D] bg-[#EEF5F3] hover:bg-[#D5E4E0] rounded-xl transition cursor-pointer"
            >
              Buka Semua
            </button>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Tutup Semua
            </button>
          </div>
        </div>

        {/* Tab Kategori Berdasarkan Role */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1 pb-0.5">
          {categories.map((cat) => {
            const isAct = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isAct
                    ? "bg-[#38746D] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. DAFTAR KARTU ACCORDION PANDUAN UTAMA                        */}
      {/* ============================================================== */}
      {filteredGuides.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Topik Panduan Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada panduan siaga yang cocok dengan kata kunci &quot;{searchQuery}&quot;. Silakan coba kata kunci lain atau reset filter kategori.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("Semua");
            }}
            className="px-4 py-2 bg-[#38746D] text-white rounded-xl text-xs font-bold hover:bg-[#24544E] transition cursor-pointer"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGuides.map((guide) => {
            const isExpanded = !!expandedIds[guide.id];
            const IconComponent = guide.icon;

            return (
              <div
                key={guide.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#D5E4E0] shadow-xs overflow-hidden transition-all duration-200 hover:border-[#38746D]/60 hover:shadow-md"
              >
                {/* Header Accordion (Bisa diklik untuk buka/tutup) */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(guide.id)}
                  className="w-full p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 text-left cursor-pointer transition select-none bg-white hover:bg-slate-50/70"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${guide.badgeColor}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          {guide.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {guide.readTime}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {guide.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
                    >
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    </motion.div>
                  </div>
                </button>

                {/* Konten Detail Accordion */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-slate-100"
                    >
                      <div className="p-4 sm:p-6 space-y-5 bg-[#FBFDFD]">
                        {/* Ringkasan Singkat Fitur */}
                        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                          <p>{guide.summary}</p>
                        </div>

                        {/* Langkah-langkah Panduan Bertahap (Numbered Steps) */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#38746D]" />
                            <span>Tahapan Pelaksanaan Langkah Demi Langkah</span>
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                            {guide.steps.map((st) => (
                              <div
                                key={st.step}
                                className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-start gap-3 hover:border-slate-300 transition"
                              >
                                <span className="w-6 h-6 rounded-full bg-[#38746D] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {st.step}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-xs font-bold text-slate-900 leading-tight">
                                    {st.title}
                                  </h5>
                                  <p className="text-[11.5px] text-slate-500 mt-1 leading-snug">
                                    {st.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Catatan Penting / Standard Operating Procedure (SOP) Callout Box */}
                        <div
                          className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 ${
                            guide.callout.type === "warning"
                              ? "bg-rose-50/80 border-rose-200 text-rose-900"
                              : guide.callout.type === "sop"
                              ? "bg-amber-50/80 border-amber-200 text-amber-900"
                              : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                          }`}
                        >
                          <Info
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              guide.callout.type === "warning"
                                ? "text-rose-600"
                                : guide.callout.type === "sop"
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          />
                          <div className="min-w-0 flex-1 text-xs">
                            <strong className="block font-bold">
                              {guide.callout.title}
                            </strong>
                            <p className="mt-0.5 leading-relaxed opacity-90">
                              {guide.callout.text}
                            </p>
                          </div>
                        </div>

                        {/* Tombol Shortcut Langsung ke Fitur Terkait */}
                        <div className="pt-1 flex items-center justify-end">
                          <Link
                            href={guide.actionUrl}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-md shadow-[#38746D]/15 active:scale-95 transition-all cursor-pointer"
                          >
                            <span>{guide.actionText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. BANNER DARURAT 24 JAM / PANGGILAN CEPAT                     */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              Kondisi Darurat Membutuhkan Evakuasi Langsung?
            </h4>
            <p className="text-xs text-rose-100 mt-0.5">
              Hubungi Layanan Bebas Pulsa Kedaruratan 112 Indramayu atau Posko Induk BPBD.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="tel:112"
            className="px-5 py-2.5 rounded-xl bg-white text-rose-700 font-extrabold text-xs sm:text-sm hover:bg-rose-50 transition-colors shadow-sm active:scale-95"
          >
            Hubungi 112 (Gratis)
          </a>
          <Link
            href={activeRole === "petugas" ? "/petugas/peta-sar" : "/warga/kontak"}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors border border-white/20"
          >
            Daftar Kontak
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DATA PANDUAN LENGKAP UNTUK WARGA INDRAMAYU
// ============================================================================
const WARGA_GUIDES: GuideItem[] = [
  {
    id: "warga-lapor",
    category: "Lapor Titik Banjir",
    title: "Tata Cara Melaporkan Genangan & Hambatan Jalan",
    tagline: "Crowdsourcing aduan warga terintegrasi GPS & validasi BPBD",
    readTime: "2 mnt baca",
    icon: MapPin,
    badgeColor: "bg-amber-50 text-amber-700 border border-amber-200",
    summary:
      "Fitur pelaporan warga memungkinkan masyarakat di pelosok desa mengirimkan informasi genangan air, tanggul rembes, dan hambatan jalan langsung ke pusat kendali BPBD dengan bukti foto dan lokasi GPS akurat.",
    steps: [
      {
        step: 1,
        title: "Buka Form Pelaporan",
        description:
          "Klik menu 'Lapor Titik Banjir' di bilah navigasi atau tombol 'Laporan Banjir' di peta.",
      },
      {
        step: 2,
        title: "Aktifkan GPS Perangkat",
        description:
          "Pastikan izin lokasi browser aktif. Sistem akan mengunci titik koordinat Anda secara otomatis.",
      },
      {
        step: 3,
        title: "Unggah Bukti Foto Lapangan",
        description:
          "Ambil foto kondisi genangan dengan menyertakan patokan seperti tiang listrik atau pagar rumah.",
      },
      {
        step: 4,
        title: "Tentukan Estimasi Kedalaman Air",
        description:
          "Pilih rentang kedalaman: Semata Kaki (10-30cm), Selutut (30-60cm), Sedada (60-120cm), atau Darurat (>120cm).",
      },
      {
        step: 5,
        title: "Kirim & Simpan Kode Tiket",
        description:
          "Setelah dikirim, tiket aduan (contoh: GEN-042) akan terbit untuk melacak status verifikasi tim SAR.",
      },
    ],
    callout: {
      type: "tip",
      title: "Tips Siaga Pelaporan",
      text:
        "Jika jaringan internet seluler melemah, data laporan akan otomatis tersimpan dalam memori PWA perangkat dan disinkronkan begitu ponsel mendeteksi sinyal kembali.",
    },
    actionUrl: "/warga/lapor",
    actionText: "Buka Fitur Lapor Banjir",
  },
  {
    id: "warga-rute",
    category: "Peta & Rute Evakuasi",
    title: "Menggunakan Navigasi Rute Bebas Banjir Menuju Posko",
    tagline: "Routing otomatis menghindari titik jalan tergenang air",
    readTime: "3 mnt baca",
    icon: Compass,
    badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    summary:
      "Peta spasial DERMAYU menggunakan algoritma pencarian rute aman yang otomatis memblokir jalan-jalan yang telah dilaporkan tergenang di atas 30 cm, memandu Anda dan keluarga ke tempat evakuasi tertinggi.",
    steps: [
      {
        step: 1,
        title: "Pilih Posko Evakuasi Tujuan",
        description:
          "Buka menu 'Peta & Rute Evakuasi' dan pilih posko terdekat atau posko dengan fasilitas medis lengkap.",
      },
      {
        step: 2,
        title: "Klik Tombol 'Arahkan Rute'",
        description:
          "Sistem memproses rute perjalanan aman dari titik GPS Anda menuju pintu masuk posko.",
      },
      {
        step: 3,
        title: "Manfaatkan Fitur Titik Singgah",
        description:
          "Gunakan tombol 'Titik Singgah' jika Anda perlu menjemput kerabat atau mengambil rute alternatif aman.",
      },
      {
        step: 4,
        title: "Ikuti Panduan Belokan Real-Time",
        description:
          "Mode navigasi menampilkan jarak tempuh (meter), estimasi waktu tiba, dan instruksi belokan jalan.",
      },
    ],
    callout: {
      type: "warning",
      title: "Peringatan Bahaya Melintasi Genangan",
      text:
        "Jangan memaksakan berkendara melewati genangan dengan arus deras meskipun rute alternatif terasa lebih jauh. Kedalaman 30 cm dapat menghanyutkan sepeda motor.",
    },
    actionUrl: "/warga/evakuasi",
    actionText: "Buka Peta & Rute Evakuasi",
  },
  {
    id: "warga-cuaca",
    category: "Indikator Cuaca",
    title: "Membaca Panel Prakiraan Cuaca 24 Jam & 7 Hari",
    tagline: "Sinkronisasi satelit BMKG & pemantauan debit DAS Cimanuk",
    readTime: "2 mnt baca",
    icon: Droplets,
    badgeColor: "bg-sky-50 text-sky-700 border border-sky-200",
    summary:
      "Informasi cuaca terpadu DERMAYU memberikan prakiraan jam-demi-jam dan mingguan sehingga warga dapat mengantisipasi luapan air rob pesisir maupun hujan lebat dari daerah hulu sungai.",
    steps: [
      {
        step: 1,
        title: "Klik Card Cuaca di Peta",
        description:
          "Ketuk Card Cuaca mengambang di pojok layar untuk membuka Panel Cuaca Detail interaktif.",
      },
      {
        step: 2,
        title: "Cek Status Peringatan Dini",
        description:
          "Kartu biru/kuning teratas akan memperingatkan jika potensi hujan dalam 1 jam ke depan mencapai 100%.",
      },
      {
        step: 3,
        title: "Telusuri Kurva 24 Jam Berikutnya",
        description:
          "Geser ke samping untuk melihat perkiraan pergeseran cuaca setiap jam beserta probabilitas hujan (PoP %).",
      },
      {
        step: 4,
        title: "Amati Rentang Suhu 7 Hari",
        description:
          "Kapsul gradient menampilkan batas suhu minimum (malam) dan maksimum (siang) untuk satu pekan ke depan.",
      },
      {
        step: 5,
        title: "Pantau Angin & Siklus Pasang Rob",
        description:
          "Periksa kecepatan angin dan waktu terbit/terbenam matahari, sangat krusial bagi warga pesisir Eretan & Karangsong.",
      },
    ],
    callout: {
      type: "tip",
      title: "Korelasi Hujan Hulu & Banjir Indramayu",
      text:
        "Hujan deras di kawasan hulu (Majalengka & Garut) membutuhkan waktu sekitar 4-6 jam untuk tiba di Bendung Rentang Indramayu.",
    },
    actionUrl: "/peta",
    actionText: "Lihat Cuaca di Peta",
  },
  {
    id: "warga-posko",
    category: "Pantauan Posko",
    title: "Mencari & Memeriksa Ketersediaan Posko Pengungsi",
    tagline: "Data kapasitas terisi, logistik sembako, dan posko medis aktif",
    readTime: "2 mnt baca",
    icon: Building2,
    badgeColor: "bg-teal-50 text-teal-700 border border-teal-200",
    summary:
      "Pantau kapasitas posko evakuasi secara langsung agar Anda tidak mendatangi posko yang telah penuh atau kekurangan persediaan medis.",
    steps: [
      {
        step: 1,
        title: "Buka Menu Pantauan Posko",
        description:
          "Akses daftar lengkap posko resmi BPBD yang beroperasi selama 24 jam penuh di wilayah terdampak.",
      },
      {
        step: 2,
        title: "Gunakan Filter Kecamatan",
        description:
          "Saring posko berdasarkan lokasi Anda (seperti Losarang, Cantigi, Kertasmaya, atau Indramayu Kota).",
      },
      {
        step: 3,
        title: "Periksa Badge Kapasitas Jiwa",
        description:
          "Perhatikan jumlah jiwa terisi vs kapasitas total (misal: 190/500 Jiwa) untuk memastikan ketersediaan ruang.",
      },
      {
        step: 4,
        title: "Cek Fasilitas Spesifik",
        description:
          "Pastikan posko memiliki fasilitas Dapur Umum Tagana, Tenaga Medis, atau Ramah Balita/Lansia sesuai kebutuhan keluarga.",
      },
    ],
    callout: {
      type: "sop",
      title: "Perlengkapan Tas Siaga Bencana (TSB)",
      text:
        "Sebelum mengungsi, bawa surat berharga dalam kantong plastik kedap air, pakaian untuk 3 hari, obat-obatan pribadi, dan senter baterai.",
    },
    actionUrl: "/warga/posko",
    actionText: "Buka Daftar Posko",
  },
];

// ============================================================================
// DATA PANDUAN LENGKAP UNTUK PETUGAS PUSDALOPS BPBD INDRAMAYU
// ============================================================================
const PETUGAS_GUIDES: GuideItem[] = [
  {
    id: "petugas-triage",
    category: "Triage & Verifikasi",
    title: "SOP Triage & Verifikasi Aduan Banjir Warga",
    tagline: "Protokol validasi laporan crowdsourcing masuk ke sistem BPBD",
    readTime: "3 mnt baca",
    icon: ShieldCheck,
    badgeColor: "bg-purple-50 text-purple-700 border border-purple-200",
    summary:
      "Petugas Pusdalops bertanggung jawab memvalidasi laporan warga yang masuk, mencocokkan koordinat dengan citra satelit/telemetri, dan menaikkan tingkat keparahan laporan ke level siaga lapangan.",
  steps: [
      {
        step: 1,
        title: "Buka Dasbor Triage Aduan",
        description:
          "Akses menu 'Triage & Verifikasi' untuk melihat daftar aduan masuk yang diurutkan berdasarkan waktu dan prioritas.",
      },
      {
        step: 2,
        title: "Validasi Foto & Bukti Lapangan",
        description:
          "Periksa foto yang diunggah warga, verifikasi metadata koordinat GPS dan kesesuaian kondisi visual jalan.",
      },
      {
        step: 3,
        title: "Tetapkan Tingkat Keparahan",
        description:
          "Klasifikasikan menjadi Sedang, Tinggi, atau KRITIS (jika ada ancaman jiwa, lansia terisolir, atau kedalaman > 1 meter).",
      },
      {
        step: 4,
        title: "Tugaskan Regu SAR Lapangan",
        description:
          "Kirim disposisi tiket ke koordinator regu penyelamat terdekat yang bertugas di kecamatan bersangkutan.",
      },
      {
        step: 5,
        title: "Ubah Status Tiket",
        description:
          "Perbarui status aduan menjadi 'Diverifikasi' atau 'Ditangani' agar pelapor mendapatkan notifikasi real-time.",
      },
    ],
    callout: {
      type: "warning",
      title: "SOP Batas Waktu Triage Kritis",
      text:
        "Aduan berlabel KRITIS wajib divalidasi dan dihubungi via telepon oleh petugas jaga maksimal 10 menit sejak laporan tercatat di sistem.",
    },
    actionUrl: "/petugas/triage",
    actionText: "Buka Dasbor Triage",
  },
  {
    id: "petugas-telemetri",
    category: "Monitoring Telemetri",
    title: "Pemantauan Sensor Ultrasonik DAS Cimanuk & Rob",
    tagline: "Ambang batas status AWAS, SIAGA, dan WASPADA pada infrastruktur air",
    readTime: "4 mnt baca",
    icon: Radio,
    badgeColor: "bg-sky-50 text-sky-700 border border-sky-200",
    summary:
      "Sistem telemetri terhubung dengan 10 sensor stasiun di Bendung Rentang, Bangkir, dan muara pesisir pantai Indramayu untuk membaca Tinggi Muka Air (TMA) dan debit per detik (m³/s).",
    steps: [
      {
        step: 1,
        title: "Buka Dasbor Telemetri TMA",
        description:
          "Pantau kartu-kartu status sensor yang diperbarui otomatis setiap 60 detik melalui jaringan satelit BBWS.",
      },
      {
        step: 2,
        title: "Perhatikan Status Bendung Rentang",
        description:
          "Bendung Rentang adalah titik hulu kunci. Status NORMAL (< 400 m³/s), WASPADA (400-600 m³/s), SIAGA (600-800 m³/s), AWAS (> 800 m³/s).",
      },
      {
        step: 3,
        title: "Analisis Tren Kenaikan Debit",
        description:
          "Jika grafik menunjukkan indikator 'NAIK CEPAT', debit air dari hulu diperkirakan tiba di pusat kota dalam 3 jam.",
      },
      {
        step: 4,
        title: "Koordinasi Pembagian Aliran Bangkir",
        description:
          "Pastikan pembagi aliran Bendung Bangkir telah disesuaikan untuk memecah beban air menuju Cimanuk Lama dan Barat.",
      },
      {
        step: 5,
        title: "Aktivasi Sirine Peringatan Dini",
        description:
          "Jika status mencapai SIAGA 1 / AWAS, picu sirine EWS di desa-desa bantaran sungai dan kirim SMS/WA blast.",
      },
    ],
    callout: {
      type: "sop",
      title: "Protokol Komunikasi Lintas Sektor",
      text:
        "Setiap kenaikan status ke SIAGA 2 wajib dilaporkan ke Kepala Pelaksana BPBD dan Camat setempat dalam waktu 15 menit.",
    },
    actionUrl: "/petugas/telemetri",
    actionText: "Buka Dasbor Telemetri",
  },
  {
    id: "petugas-posko",
    category: "Manajemen Posko",
    title: "Tata Kelola Kapasitas, Fasilitas, & Logistik Posko",
    tagline: "Pengawasan daya tampung dan pendistribusian bansos pengungsi",
    readTime: "3 mnt baca",
    icon: Building2,
    badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    summary:
      "Petugas posko lapangan wajib memperbarui data okupansi pengungsi dan cadangan logistik agar tidak terjadi kekurangan makanan atau obat-obatan di lokasi evakuasi.",
    steps: [
      {
        step: 1,
        title: "Input Pendataan Warga Mengungsi",
        description:
          "Catat jumlah kepala keluarga, lansia, balita, dan penyandang disabilitas yang masuk ke posko.",
      },
      {
        step: 2,
        title: "Pantau Kapasitas Maksimum",
        description:
          "Jika okupansi mencapai 85%, sistem akan menyalakan penanda kuning; jika 100%, sistem otomatis mengarahkan warga ke posko alternatif.",
      },
      {
        step: 3,
        title: "Inventarisasi Sembako & Obat",
        description:
          "Perbarui data stok beras (kg), mie instan (dus), air mineral, selimut, dan tabung oksigen darurat.",
      },
      {
        step: 4,
        title: "Verifikasi Posko Medis & Dapur",
        description:
          "Pastikan dapur umum Tagana beroperasi dengan higienis dan tenaga medis dari Puskesmas setempat siaga.",
      },
    ],
    callout: {
      type: "tip",
      title: "Jadwal Pelaporan Harian",
      text:
        "Data posko disinkronkan ke pusat kendali setiap pukul 07.00 WIB dan 18.00 WIB sebagai bahan rapat koordinasi pimpinan daerah.",
    },
    actionUrl: "/petugas/posko",
    actionText: "Buka Manajemen Posko",
  },
  {
    id: "petugas-sar",
    category: "Koordinasi SAR",
    title: "Koordinasi Armada Perahu & Operasi Penyelamatan",
    tagline: "Tracking posisi regu perahu karet dan jalur evakuasi lapangan",
    readTime: "3 mnt baca",
    icon: Activity,
    badgeColor: "bg-red-50 text-red-700 border border-red-200",
    summary:
      "Fitur Peta Spasial & SAR memetakan posisi personel di lapangan, ketersediaan perahu karet (LCR), dan jalur darurat untuk mengevakuasi korban yang terjebak banjir.",
    steps: [
      {
        step: 1,
        title: "Buka Peta Operasi Spasial & SAR",
        description:
          "Lihat sebaran titik genangan kritis dan posisi posko penyelamatan di seluruh wilayah Indramayu.",
      },
      {
        step: 2,
        title: "Identifikasi Target Korban Evakuasi",
        description:
          "Prioritaskan aduan dengan warga lanjut usia, pasien sakit, atau bayi yang terisolasi di atap rumah.",
      },
      {
        step: 3,
        title: "Tugaskan Armada LCR & Personel",
        description:
          "Tetapkan nomor perahu karet, personel kemudi, dan jalur masuk yang terhindar dari tiang listrik roboh.",
      },
      {
        step: 4,
        title: "Pantau Radio Komunikasi",
        description:
          "Gunakan frekuensi darurat BPBD dan konfirmasi status evakuasi setelah korban berhasil dibawa ke posko.",
      },
    ],
    callout: {
      type: "warning",
      title: "Keselamatan Personel Lapangan",
      text:
        "Setiap regu penyelamat wajib terdiri dari minimal 4 orang dengan perlengkapan life jacket lengkap, senter kedap air, dan tali lempar 25 meter.",
    },
    actionUrl: "/petugas/peta-sar",
    actionText: "Buka Peta Spasial & SAR",
  },
];
