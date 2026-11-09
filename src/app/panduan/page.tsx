"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { getActiveSession } from "@/utils/authSession";
import {
  BookOpen,
  LifeBuoy,
  Gauge,
  MapPin,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Clock,
  ArrowRight,
  Radio,
  ExternalLink,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

// Stagger variant untuk badge di hero
const badgeContainerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.46,
    },
  },
};

const badgeItemVariant = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// Stagger variant untuk container kartu panduan
const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

// Item fade-up dengan spring/cubic-bezier modern
const itemFadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const QUICK_GUIDES = [
  {
    id: "evakuasi",
    title: "Protokol Evakuasi Cepat",
    tagline: "Tanggap Darurat 45 Menit",
    description:
      "Langkah penyelamatan diri, pengamanan aset rumah, tas siaga bencana 72 jam, dan rute dataran tinggi menuju posko pengungsi resmi BPBD.",
    icon: <LifeBuoy className="w-6 h-6 text-[#38746D]" />,
    targetId: "#panduan-evakuasi",
  },
  {
    id: "tma",
    title: "Pemantauan Status TMA",
    tagline: "Sensor Ultrasonik Real-Time",
    description:
      "Cara membaca 4 tingkatan status siaga Bendung Rentang & Bangkir mulai dari Siaga 4 (Normal) hingga Siaga 1 (Bahaya banjir primer).",
    icon: <Gauge className="w-6 h-6 text-[#38746D]" />,
    targetId: "#panduan-tma",
  },
  {
    id: "lapor",
    title: "Pelaporan Titik Genangan",
    tagline: "Crowdsourcing Terpadu",
    description:
      "Tata cara mengambil foto bukti lapangan, menandai koordinat GPS otomatis, dan memilih estimasi kedalaman genangan via smartphone.",
    icon: <MapPin className="w-6 h-6 text-[#38746D]" />,
    targetId: "#panduan-lapor",
  },
];

export default function PanduanPage() {
  const router = useRouter();

  useEffect(() => {
    const s = getActiveSession();
    if (s?.role) {
      router.replace(`/${s.role}/panduan`);
    }
  }, [router]);
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#132422]">
      {/* 1. Header Navbar dengan Scroll-Spy */}
      <SiteHeader />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* HERO SECTION PANDUAN (Staggered Entrance dari Bawah)        */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF5F3] to-[#F8FAF9] pt-14 sm:pt-20 pb-16 sm:pb-24 border-b border-[#E8F1EE]">
          {/* Subtle Decorative Background Blobs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#38746D]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#38746D]/8 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
            {/* 1. Pill Badge Edukasi */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-[#38746D] border border-[#D5E4E0] shadow-xs mb-5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#38746D]" />
              <span>Pusat Edukasi &amp; Kesiapsiagaan Indramayu</span>
            </motion.div>

            {/* 2. Judul Utama */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#132422] max-w-3xl mx-auto leading-tight"
            >
              Panduan Mitigasi &amp; Tanggap Bencana Banjir
            </motion.h1>

            {/* 3. Deskripsi Paragraf */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-sm sm:text-base text-[#4B635F] max-w-2xl mx-auto leading-relaxed"
            >
              Protokol resmi kesiapsiagaan luapan Sungai Cimanuk, pemahaman sensor telemetri TMA,
              dan langkah pelaporan cepat warga berbasis geospasial real-time.
            </motion.p>

            {/* 4. Deretan Badge Standar dengan Stagger Container */}
            <motion.div
              variants={badgeContainerStagger}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-[#4B635F]"
            >
              <motion.div
                variants={badgeItemVariant}
                className="flex items-center gap-1.5 bg-white/90 border border-[#D5E4E0] px-3.5 py-1.5 rounded-full shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#38746D]" />
                <span>Standar BPBD Indramayu</span>
              </motion.div>
              <motion.div
                variants={badgeItemVariant}
                className="flex items-center gap-1.5 bg-white/90 border border-[#D5E4E0] px-3.5 py-1.5 rounded-full shadow-xs"
              >
                <Clock className="w-4 h-4 text-[#38746D]" />
                <span>Diperbarui Oktober 2026</span>
              </motion.div>
              <motion.div
                variants={badgeItemVariant}
                className="flex items-center gap-1.5 bg-white/90 border border-[#D5E4E0] px-3.5 py-1.5 rounded-full shadow-xs"
              >
                <Radio className="w-4 h-4 text-[#38746D]" />
                <span>Terhubung Sensor IoT</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* QUICK OVERVIEW / FEATURED GUIDELINES CARDS                   */}
        {/* ============================================================ */}
        <section className="py-12 sm:py-16 max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#38746D]">
              Akses Cepat Panduan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#132422] mt-1">
              Topik Kesiapsiagaan Utama
            </h2>
            <p className="text-xs sm:text-sm text-[#4B635F] mt-1 max-w-lg mx-auto">
              Pilih topik di bawah ini untuk langsung melompat ke panduan langkah-demi-langkah.
            </p>
          </div>

          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {QUICK_GUIDES.map((guide) => (
              <motion.a
                key={guide.id}
                href={guide.targetId}
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white border border-[#D5E4E0] rounded-2xl p-6 shadow-xs hover:border-[#38746D] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center text-xl mb-4 font-bold group-hover:scale-105 transition-transform">
                    {guide.icon}
                  </div>
                  <div className="text-[11px] font-bold text-[#38746D] uppercase tracking-wider mb-1">
                    {guide.tagline}
                  </div>
                  <h3 className="text-lg font-bold text-[#132422] mb-2 group-hover:text-[#38746D] transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4B635F] leading-relaxed mb-4">
                    {guide.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E8F1EE] flex items-center justify-between text-xs font-semibold text-[#38746D]">
                  <span>Pelajari panduan</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.a>
            ))}
          </motion.div>
        </section>

        {/* ============================================================ */}
        {/* 3 CORE DETAILED PROTOCOL SECTIONS                            */}
        {/* ============================================================ */}
        <section className="pb-16 sm:pb-24 max-w-6xl mx-auto px-6 space-y-14">
          {/* ---------------------------------------------------------- */}
          {/* PANDUAN 1: Evakuasi Cepat DAS Cimanuk                      */}
          {/* ---------------------------------------------------------- */}
          <motion.div
            id="panduan-evakuasi"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="scroll-mt-24 bg-white rounded-3xl border border-[#D5E4E0] p-6 sm:p-10 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#E8F1EE]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#38746D]/10 text-[#38746D] flex items-center justify-center shrink-0 border border-[#38746D]/20">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#38746D]">
                    Protokol Evakuasi Lapangan
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#132422] mt-0.5">
                    Panduan Evakuasi Cepat Banjir Luapan Sungai Cimanuk
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4B635F] mt-1">
                    Fokus prioritas untuk warga di sempadan sungai: Kec. Sindang, Losarang,
                    Cantigi, Pasekan, Lohbener, &amp; Jatibarang.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3.5 py-1.5 rounded-full shrink-0 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Waktu Respon Aman: &lt; 45 Menit</span>
              </div>
            </div>

            {/* Step by Step Grid */}
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8"
            >
              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:border-[#38746D] hover:shadow-xs transition-all space-y-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-[#38746D] text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h4 className="font-bold text-sm text-[#132422]">Amankan Tas Siaga 72 Jam</h4>
                <p className="text-xs text-[#4B635F] leading-relaxed">
                  Siapkan surat berharga (sertifikat, KK, ijazah) dalam plastik kedap air, obat-obatan
                  pribadi, senter, powerbank, dan air minum 2 liter.
                </p>
              </motion.div>

              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:border-[#38746D] hover:shadow-xs transition-all space-y-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-[#38746D] text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h4 className="font-bold text-sm text-[#132422]">Matikan MCB Listrik &amp; Gas</h4>
                <p className="text-xs text-[#4B635F] leading-relaxed">
                  Putus arus listrik utama di meteran PLN untuk mencegah korsleting dan lepas regulator
                  tabung gas sebelum genangan air masuk ke rumah.
                </p>
              </motion.div>

              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:border-[#38746D] hover:shadow-xs transition-all space-y-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-[#38746D] text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h4 className="font-bold text-sm text-[#132422]">Gunakan Jalur Evakuasi Aman</h4>
                <p className="text-xs text-[#4B635F] leading-relaxed">
                  Hindari menyeberangi saluran irigasi atau tanggul yang rapuh. Ikuti rambu penunjuk
                  arah evakuasi BPBD menuju jalan kabupaten bertingkat tinggi.
                </p>
              </motion.div>

              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:border-[#38746D] hover:shadow-xs transition-all space-y-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-[#38746D] text-white flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <h4 className="font-bold text-sm text-[#132422]">Registrasi di Posko Resmi</h4>
                <p className="text-xs text-[#4B635F] leading-relaxed">
                  Lapor ke petugas PMI/BPBD di posko induk kecamatan agar nama keluarga Anda tercatat
                  dalam daftar penerima logistik dan bantuan medis.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ---------------------------------------------------------- */}
          {/* PANDUAN 2: Cara Membaca Status TMA (Tinggi Muka Air)       */}
          {/* ---------------------------------------------------------- */}
          <motion.div
            id="panduan-tma"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="scroll-mt-24 bg-white rounded-3xl border border-[#D5E4E0] p-6 sm:p-10 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#E8F1EE]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#38746D]/10 text-[#38746D] flex items-center justify-center shrink-0 border border-[#38746D]/20">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#38746D]">
                    Sensor Telemetri IoT
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#132422] mt-0.5">
                    Cara Membaca Status Ketinggian Muka Air (TMA)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4B635F] mt-1">
                    Nilai ambang batas sensor di Pos Pemantau Bendung Rentang &amp; Saluran Pembuang
                    Bangkir.
                  </p>
                </div>
              </div>

              <Link
                href="/#peta"
                className="inline-flex items-center gap-2 bg-[#EEF5F3] hover:bg-[#D5E4E0] text-[#38746D] text-xs font-semibold px-4 py-2 rounded-full shrink-0 transition-colors"
              >
                <span>Buka Dasbor Peta</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4 Status Threshold Grid */}
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
            >
              {/* Level Siaga 4 */}
              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left space-y-2 hover:shadow-xs transition-all"
              >
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-700 text-white font-bold text-[11px] tracking-wide">
                  SIAGA 4 · NORMAL
                </div>
                <div className="text-xs font-bold text-emerald-950">TMA &lt; 350 cm</div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Debit air terkendali, aliran sungai normal. Pintu air irigasi beroperasi sesuai
                  jadwal pengaliran musiman normal.
                </p>
              </motion.div>

              {/* Level Siaga 3 */}
              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2 hover:shadow-xs transition-all"
              >
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-bold text-[11px] tracking-wide">
                  SIAGA 3 · WASPADA
                </div>
                <div className="text-xs font-bold text-amber-950">TMA 350 – 499 cm</div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Peningkatan debit akibat hujan di hulu Sumedang/Majalengka. Petugas piket pos
                  siaga memonitor pintu air secara intensif per 30 menit.
                </p>
              </motion.div>

              {/* Level Siaga 2 */}
              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-orange-50/80 border border-orange-200 text-left space-y-2 hover:shadow-xs transition-all"
              >
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-orange-600 text-white font-bold text-[11px] tracking-wide">
                  SIAGA 2 · KRITIS
                </div>
                <div className="text-xs font-bold text-orange-950">TMA 500 – 599 cm</div>
                <p className="text-xs text-orange-900 leading-relaxed">
                  Air mendekati bibir tanggul utama. Potensi genangan dataran rendah dalam 2–4 jam.
                  Sirene peringatan dini dibunyikan, warga lansia &amp; balita mulai diungsikan.
                </p>
              </motion.div>

              {/* Level Siaga 1 */}
              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-red-50/80 border border-red-200 text-left space-y-2 hover:shadow-xs transition-all"
              >
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-red-600 text-white font-bold text-[11px] tracking-wide">
                  SIAGA 1 · BAHAYA
                </div>
                <div className="text-xs font-bold text-red-950">TMA &ge; 600 cm</div>
                <p className="text-xs text-red-900 leading-relaxed">
                  Status darurat aktif. Limpasan atau jebol tanggul primer terjadi. Evakuasi
                  mandiri total warga bantaran, perahu karet BASARNAS &amp; BPBD dikerahkan penuh.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ---------------------------------------------------------- */}
          {/* PANDUAN 3: Prosedur Pelaporan Titik Genangan Warga        */}
          {/* ---------------------------------------------------------- */}
          <motion.div
            id="panduan-lapor"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="scroll-mt-24 bg-white rounded-3xl border border-[#D5E4E0] p-6 sm:p-10 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#E8F1EE]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#38746D]/10 text-[#38746D] flex items-center justify-center shrink-0 border border-[#38746D]/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#38746D]">
                    Partisipasi Komunitas
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#132422] mt-0.5">
                    Prosedur Pelaporan Titik Genangan Air Warga
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4B635F] mt-1">
                    Bantu sesama warga Indramayu dengan melaporkan kondisi jalan dan pemukiman yang
                    tergenang secara akurat.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-semibold px-4 py-2 rounded-full shrink-0 transition-colors shadow-xs"
              >
                <span>Masuk untuk Melapor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Steps Pelaporan Grid */}
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8"
            >
              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:border-[#38746D] hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#38746D]">
                  <span className="w-6 h-6 rounded-full bg-[#38746D] text-white flex items-center justify-center text-[11px]">
                    A
                  </span>
                  <span>Foto &amp; GPS Otomatis</span>
                </div>
                <h4 className="font-bold text-sm text-[#132422]">Ambil Bukti Lapangan</h4>
                <p className="text-xs text-[#4B635F] leading-relaxed">
                  Izinkan browser mendeteksi koordinat lintang &amp; bujur otomatis. Ambil foto tegak
                  lurus dengan objek pembanding (seperti ban kendaraan atau tiang pagar rumah).
                </p>
              </motion.div>

              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:border-[#38746D] hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#38746D]">
                  <span className="w-6 h-6 rounded-full bg-[#38746D] text-white flex items-center justify-center text-[11px]">
                    B
                  </span>
                  <span>Tentukan Ketinggian Air</span>
                </div>
                <h4 className="font-bold text-sm text-[#132422]">Pilih Kategori Kedalaman</h4>
                <p className="text-xs text-[#4B635F] leading-relaxed">
                  Tentukan taksiran kedalaman: Ringan (10–30 cm), Sedang (31–70 cm), atau Kritis (&gt;
                  70 cm). Cantumkan keterangan jika ada warga rentan yang membutuhkan perahu.
                </p>
              </motion.div>

              <motion.div
                variants={itemFadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:border-[#38746D] hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#38746D]">
                  <span className="w-6 h-6 rounded-full bg-[#38746D] text-white flex items-center justify-center text-[11px]">
                    C
                  </span>
                  <span>Validasi Cepat Petugas</span>
                </div>
                <h4 className="font-bold text-sm text-[#132422]">Verifikasi &lt; 15 Menit</h4>
                <p className="text-xs text-[#4B635F] leading-relaxed">
                  Petugas piket BPBD dan relawan terdekat akan memvalidasi keaslian laporan Anda.
                  Titik merah akan muncul di peta publik untuk peringatan bagi pengguna jalan.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ---------------------------------------------------------- */}
          {/* HOTLINE DARURAT TERPADU INDRAMAYU                          */}
          {/* ---------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
            className="p-6 sm:p-9 rounded-3xl bg-gradient-to-br from-[#1D443F] to-[#132422] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#A4C6C1]">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Pusat Panggilan Darurat 24 Jam</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Butuh Bantuan Evakuasi Mendesak?</h3>
              <p className="text-xs sm:text-sm text-[#C7DBD7] max-w-xl">
                Hubungi Call Center Terpadu BPBD Indramayu atau layanan darurat bebas pulsa 112
                untuk penjemputan perahu karet darurat dan bantuan medis darurat.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href="tel:112"
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Call Center 112</span>
              </a>
              <a
                href="tel:0234274644"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full transition-all active:scale-95 flex items-center gap-2"
              >
                <span>(0234) 274644 (BPBD)</span>
              </a>
            </div>
          </motion.div>
        </section>
      </main>

      {/* 4. Footer */}
      <SiteFooter />
    </div>
  );
}
