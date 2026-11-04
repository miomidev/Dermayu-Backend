"use client";

import Link from "next/link";
import { ForkedRouteIcon, PoskoShelterIcon } from "@/components/ui/Icons";
import { Hero3DImage } from "@/components/dashboard/Hero3DImage";
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
              Tanggap Bencana, Satu Sentuhan!
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
        className="space-y-5"
      >
      {/* ============================================================ */}
      {/* 2. GRID "FITUR TANGGAP DARURAT" (2X2 DI MOBILE)             */}
      {/* ============================================================ */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Fitur Tanggap Darurat
          </h2>
          <Link
            href="/warga/evakuasi"
            className="text-xs font-bold text-[#155E45] hover:underline flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Card 1: Lapor Banjir */}
          <Link
            href="/warga/lapor"
            className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between hover:border-rose-200 hover:shadow-sm transition-all group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100/80 group-hover:scale-105 transition-transform">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 leading-tight truncate">
                  Lapor Banjir
                </h3>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                  Foto &amp; GPS Otomatis
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* Card 2: Rute Evakuasi */}
          <Link
            href="/warga/evakuasi"
            className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between hover:border-emerald-200 hover:shadow-sm transition-all group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#155E45] flex items-center justify-center shrink-0 border border-emerald-100/80 group-hover:scale-105 transition-transform">
                <ForkedRouteIcon className="w-5 h-5 text-[#155E45]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 leading-tight truncate">
                  Rute Aman
                </h3>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                  Peta Genangan Real-time
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* Card 3: Posko & Logistik */}
          <Link
            href="/warga/posko"
            className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between hover:border-teal-200 hover:shadow-sm transition-all group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100/80 group-hover:scale-105 transition-transform">
                <PoskoShelterIcon className="w-5 h-5 text-teal-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 leading-tight truncate">
                  Posko Pengungsi
                </h3>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                  Kapasitas &amp; Logistik
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* Card 4: Darurat 112 */}
          <Link
            href="/warga/kontak"
            className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between hover:border-amber-200 hover:shadow-sm transition-all group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/80 group-hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 leading-tight truncate">
                  Darurat 112
                </h3>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                  Pusdalops BPBD
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
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
                  className="text-xs font-bold text-[#155E45] hover:underline"
                >
                  Rincian &gt;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. TELEMETRI AIR & STATUS WILAYAH (DESKTOP WIDGET)           */}
      {/* ============================================================ */}
      <section className="bg-white md:bg-[#F8FAF9] border border-[#D5E4E0] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-bold text-[#1D443F]">Status Siaga Indramayu:</span>
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold border border-amber-300 text-[11px]">
            SIAGA II (Waspada Rob)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#4B635F] text-[11px] sm:text-xs flex-wrap">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-[#38746D]" />
            Debit Rentang: <strong className="text-[#132422]">310 m³/s</strong>
          </span>
          <span className="text-[#A4C6C1]">•</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#38746D]" />
            Radar Muara: <strong className="text-[#132422]">+65 cm</strong>
          </span>
        </div>
      </section>
      </motion.div>
    </div>
  );
}

