"use client";

import Link from "next/link";
import { ForkedRouteIcon, PoskoShelterIcon } from "@/components/ui/Icons";
import { Hero3DImage } from "@/components/dashboard/Hero3DImage";
import { StatusSiagaCard } from "@/components/dashboard/StatusSiagaCard";
import { motion } from "motion/react";
import {
  Megaphone,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Droplets,
  Activity,
  ArrowRight,
  Users,
} from "lucide-react";

export function WargaDashboardContent() {
  return (
    <div className="space-y-5 max-w-4xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* 1. HERO BANNER KHUSUS DESKTOP (DI MOBILE SUDAH DI APP HEADER) */}
      {/* ============================================================ */}
      <div className="hidden md:block bg-gradient-to-r from-[#0E3D2D] to-[#155E45] text-white rounded-3xl p-6 lg:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold mb-3 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pusat Kesiapsiagaan Warga Indramayu</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight leading-snug">
              Tanggap Banjir, Satu Sentuhan!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
              Layanan cepat, aman &amp; terpercaya untuk keselamatan warga Indramayu menghadapi potensi banjir rob pesisir dan luapan DAS Cimanuk.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/warga/evakuasi"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#0E3D2D] text-xs font-black shadow-md hover:bg-emerald-50 transition"
              >
                <span>Cek Rute Evakuasi Mandiri</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/warga/lapor"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition"
              >
                <span>Buat Laporan Baru</span>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block shrink-0">
            <Hero3DImage className="w-44 h-44" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KONTEN HALAMAN DASHBOARD BAWAH (ENTER PHASE 2)               */}
      {/* Meluncur halus dari samping/bawah secara bertahap            */}
      {/* ============================================================ */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-4 sm:space-y-5"
      >
        {/* ============================================================ */}
        {/* 2. STATUS SIAGA & TELEMETRI AIR (CARD BANNER REF GAMBAR 2)  */}
        {/* ============================================================ */}
        <StatusSiagaCard />

        {/* ============================================================ */}
        {/* 3. GRID "FITUR TANGGAP BANJIR"                               */}
        {/* ============================================================ */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Fitur Tanggap Banjir
          </h2>
          <Link
            href="/warga/evakuasi"
            replace
            scroll={false}
            className="text-xs font-bold text-[#155E45] hover:underline flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {/* Card 1: Lapor Banjir */}
          <Link
            href="/warga/lapor"
            replace
            scroll={false}
            className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#38746D]/20 sm:border-[#E8F1EE] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[98px] sm:min-h-[110px] sm:hover:border-[#38746D]/40 sm:hover:shadow-sm transition-all group active:scale-[0.97]"
          >
            {/* Pattern Ornament Top-Right (Belah Ketupat: Gap Pas, Ukuran Pas, Sembunyi Sedikit di Sudut Kanan Atas) */}
            <svg
              className="absolute -top-1 -right-1 w-16 h-16 sm:w-18 sm:h-18 text-[#38746D]/18 sm:text-[#38746D]/14 pointer-events-none sm:group-hover:text-[#38746D]/26 sm:group-hover:scale-105 transition-all duration-300"
              viewBox="0 0 64 64"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="32.25" y="3.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 11)" />
              <rect x="45.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 53 24)" />
              <rect x="32.25" y="29.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 37)" />
              <rect x="19.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 27 24)" />
            </svg>

            {/* Persegi Icon di Kiri Atas (Warna Hover Aktif Langsung Aktif di Mobile) */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#38746D] text-white border border-[#38746D] shadow-2xs sm:bg-[#EEF5F3] sm:text-[#38746D] sm:border-[#38746D]/15 sm:group-hover:bg-[#38746D] sm:group-hover:text-white sm:group-hover:border-[#38746D] flex items-center justify-center shrink-0 transition-all duration-200">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" />
            </div>

            {/* Judul Tombol */}
            <div>
              <h3 className="text-[11px] sm:text-xs font-bold text-slate-800 sm:group-hover:text-[#1D443F] leading-tight line-clamp-2">
                Lapor Banjir
              </h3>
            </div>
          </Link>

          {/* Card 2: Rute Evakuasi */}
          <Link
            href="/warga/evakuasi"
            replace
            scroll={false}
            className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#38746D]/20 sm:border-[#E8F1EE] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[98px] sm:min-h-[110px] sm:hover:border-[#38746D]/40 sm:hover:shadow-sm transition-all group active:scale-[0.97]"
          >
            {/* Pattern Ornament Top-Right (1 Lingkaran Tebal & 1 Lingkaran Sedang) */}
            <svg
              className="absolute -top-1 -right-1 w-16 h-16 sm:w-18 sm:h-18 text-[#38746D]/18 sm:text-[#38746D]/14 pointer-events-none sm:group-hover:text-[#38746D]/26 sm:group-hover:scale-105 transition-all duration-300"
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="53" cy="11" r="15" strokeWidth="8" />
              <circle cx="53" cy="11" r="29" strokeWidth="4.2" opacity="0.85" />
            </svg>

            {/* Persegi Icon di Kiri Atas */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#38746D] text-white border border-[#38746D] shadow-2xs sm:bg-[#EEF5F3] sm:text-[#38746D] sm:border-[#38746D]/15 sm:group-hover:bg-[#38746D] sm:group-hover:text-white sm:group-hover:border-[#38746D] flex items-center justify-center shrink-0 transition-all duration-200">
              <ForkedRouteIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" />
            </div>

            {/* Judul Tombol */}
            <div>
              <h3 className="text-[11px] sm:text-xs font-bold text-slate-800 sm:group-hover:text-[#1D443F] leading-tight line-clamp-2">
                Rute Aman
              </h3>
            </div>
          </Link>

          {/* Card 3: Posko & Logistik */}
          <Link
            href="/warga/posko"
            replace
            scroll={false}
            className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#38746D]/20 sm:border-[#E8F1EE] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[98px] sm:min-h-[110px] sm:hover:border-[#38746D]/40 sm:hover:shadow-sm transition-all group active:scale-[0.97]"
          >
            {/* Pattern Ornament Top-Right (Belah Ketupat) */}
            <svg
              className="absolute -top-1 -right-1 w-16 h-16 sm:w-18 sm:h-18 text-[#38746D]/18 sm:text-[#38746D]/14 pointer-events-none sm:group-hover:text-[#38746D]/26 sm:group-hover:scale-105 transition-all duration-300"
              viewBox="0 0 64 64"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="32.25" y="3.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 11)" />
              <rect x="45.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 53 24)" />
              <rect x="32.25" y="29.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 37)" />
              <rect x="19.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 27 24)" />
            </svg>

            {/* Persegi Icon di Kiri Atas */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#38746D] text-white border border-[#38746D] shadow-2xs sm:bg-[#EEF5F3] sm:text-[#38746D] sm:border-[#38746D]/15 sm:group-hover:bg-[#38746D] sm:group-hover:text-white sm:group-hover:border-[#38746D] flex items-center justify-center shrink-0 transition-all duration-200">
              <PoskoShelterIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" />
            </div>

            {/* Judul Tombol */}
            <div>
              <h3 className="text-[11px] sm:text-xs font-bold text-slate-800 sm:group-hover:text-[#1D443F] leading-tight line-clamp-2">
                Posko Pengungsi
              </h3>
            </div>
          </Link>

          {/* Card 4: Komunitas Warga */}
          <Link
            href="/warga/komunitas"
            replace
            scroll={false}
            className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#38746D]/20 sm:border-[#E8F1EE] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[98px] sm:min-h-[110px] sm:hover:border-[#38746D]/40 sm:hover:shadow-sm transition-all group active:scale-[0.97]"
          >
            {/* Pattern Ornament Top-Right (1 Lingkaran Tebal & 1 Lingkaran Sedang) */}
            <svg
              className="absolute -top-1 -right-1 w-16 h-16 sm:w-18 sm:h-18 text-[#38746D]/18 sm:text-[#38746D]/14 pointer-events-none sm:group-hover:text-[#38746D]/26 sm:group-hover:scale-105 transition-all duration-300"
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="53" cy="11" r="15" strokeWidth="8" />
              <circle cx="53" cy="11" r="29" strokeWidth="4.2" opacity="0.85" />
            </svg>

            {/* Persegi Icon di Kiri Atas */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#38746D] text-white border border-[#38746D] shadow-2xs sm:bg-[#EEF5F3] sm:text-[#38746D] sm:border-[#38746D]/15 sm:group-hover:bg-[#38746D] sm:group-hover:text-white sm:group-hover:border-[#38746D] flex items-center justify-center shrink-0 transition-all duration-200">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" />
            </div>

            {/* Judul Tombol */}
            <div>
              <h3 className="text-[11px] sm:text-xs font-bold text-slate-800 sm:group-hover:text-[#1D443F] leading-tight line-clamp-2">
                Komunitas Warga
              </h3>
            </div>
          </Link>

          {/* Card 5: Darurat 112 */}
          <Link
            href="/warga/kontak"
            replace
            scroll={false}
            className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#38746D]/20 sm:border-[#E8F1EE] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[98px] sm:min-h-[110px] sm:hover:border-[#38746D]/40 sm:hover:shadow-sm transition-all group active:scale-[0.97]"
          >
            {/* Pattern Ornament Top-Right (Belah Ketupat) */}
            <svg
              className="absolute -top-1 -right-1 w-16 h-16 sm:w-18 sm:h-18 text-[#38746D]/18 sm:text-[#38746D]/14 pointer-events-none sm:group-hover:text-[#38746D]/26 sm:group-hover:scale-105 transition-all duration-300"
              viewBox="0 0 64 64"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="32.25" y="3.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 11)" />
              <rect x="45.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 53 24)" />
              <rect x="32.25" y="29.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 37)" />
              <rect x="19.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 27 24)" />
            </svg>

            {/* Persegi Icon di Kiri Atas */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#38746D] text-white border border-[#38746D] shadow-2xs sm:bg-[#EEF5F3] sm:text-[#38746D] sm:border-[#38746D]/15 sm:group-hover:bg-[#38746D] sm:group-hover:text-white sm:group-hover:border-[#38746D] flex items-center justify-center shrink-0 transition-all duration-200">
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" />
            </div>

            {/* Judul Tombol */}
            <div>
              <h3 className="text-[11px] sm:text-xs font-bold text-slate-800 sm:group-hover:text-[#1D443F] leading-tight line-clamp-2">
                Darurat 112
              </h3>
            </div>
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. DAFTAR "PANTAUAN ADUAN TERVERIFIKASI"                      */}
      {/* ============================================================ */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Pantauan Aduan Terverifikasi
          </h2>
          <Link
            href="/warga/aduan"
            replace
            scroll={false}
            className="text-xs font-bold text-[#155E45] hover:underline flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {/* ITEM 1: Eretan Wetan */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex gap-3 items-center hover:border-slate-200 transition-all">
            {/* Thumbnail + Badge Rob 45 cm */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
              <img
                src="/report-eretan.png"
                alt="Banjir Eretan Wetan"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/65 text-white text-[9px] font-semibold backdrop-blur-xs">
                Rob 45 cm
              </span>
            </div>

            {/* Konten Kanan */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Validasi AI 94%</span>
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">12m lalu</span>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 truncate">
                Eretan Wetan • Genangan 45 cm
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5 leading-tight">
                Akses jalan pelelangan ikan terdampak pasang air laut.
              </p>

              <div className="border-t border-slate-100 my-1.5" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Tiket #DMY-0042
                </span>
                <Link
                  href="/warga/aduan"
                  replace
                  scroll={false}
                  className="text-xs font-bold text-[#155E45] hover:underline"
                >
                  Rincian &gt;
                </Link>
              </div>
            </div>
          </div>

          {/* ITEM 2: Parean Girang */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex gap-3 items-center hover:border-slate-200 transition-all">
            {/* Thumbnail + Badge Tanggul OK */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
              <img
                src="/report-parean.png"
                alt="Tanggul Parean Girang"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#0E3D2D]/85 text-white text-[9px] font-semibold backdrop-blur-xs">
                Tanggul OK
              </span>
            </div>

            {/* Konten Kanan */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Tim Terkonfirmasi</span>
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">35m lalu</span>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 truncate">
                Parean Girang • Tanggul Aman
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5 leading-tight">
                Pintu air sekunder ditutup tepat waktu sesuai protokol siaga.
              </p>

              <div className="border-t border-slate-100 my-1.5" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Tiket #DMY-0038
                </span>
                <Link
                  href="/warga/aduan"
                  replace
                  scroll={false}
                  className="text-xs font-bold text-[#155E45] hover:underline"
                >
                  Rincian &gt;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      </motion.div>
    </div>
  );
}

