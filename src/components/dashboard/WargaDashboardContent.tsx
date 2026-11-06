"use client";

import { useState } from "react";
import Link from "next/link";
import { ForkedRouteIcon, PoskoShelterIcon, BeaconAlertIcon } from "@/components/ui/Icons";
import { Hero3DImage } from "@/components/dashboard/Hero3DImage";
import { AuthBackgroundDecor } from "@/components/auth/AuthBackgroundDecor";
import { StatusSiagaCard } from "@/components/dashboard/StatusSiagaCard";
import { motion } from "motion/react";
import {
  Megaphone,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
  Users,
  MoreVertical,
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
} from "lucide-react";

interface AduanCardItem {
  id: string;
  condition: string;
  location: string;
  badgeLabel: string;
  badgeType: "ai" | "team";
  timeAgo: string;
  photoUrl: string;
  description: string;
}

const ADUAN_ITEMS: AduanCardItem[] = [
  {
    id: "1",
    condition: "Genangan 45 cm",
    location: "Eretan Wetan, Kandanghaur",
    badgeLabel: "Validasi AI 94%",
    badgeType: "ai",
    timeAgo: "12m lalu",
    photoUrl: "https://images.unsplash.com/photo-1534862262637-373c120dcbcc?auto=format&fit=crop&w=600&q=80",
    description: "Akses jalan pelelangan ikan terdampak pasang air laut.",
  },
  {
    id: "2",
    condition: "Tanggul Aman",
    location: "Parean Girang, Kandanghaur",
    badgeLabel: "Tim Terkonfirmasi",
    badgeType: "team",
    timeAgo: "35m lalu",
    photoUrl: "https://images.unsplash.com/photo-1672559987522-897ef4612604?auto=format&fit=crop&w=600&q=80",
    description: "Pintu air sekunder ditutup tepat waktu sesuai protokol siaga rob.",
  },
  {
    id: "3",
    condition: "Luapan Saluran 30 cm",
    location: "Kandanghaur, Indramayu",
    badgeLabel: "Validasi AI 91%",
    badgeType: "ai",
    timeAgo: "1j lalu",
    photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
    description: "Debit pembuang Cilet tersumbat sampah ranting, penanganan dimulai.",
  },
  {
    id: "4",
    condition: "Genangan Rob 20 cm",
    location: "Cantigi Kulon, Cantigi",
    badgeLabel: "Validasi AI 92%",
    badgeType: "ai",
    timeAgo: "2j lalu",
    photoUrl: "https://images.unsplash.com/photo-1741110539426-fce3268c3c0d?auto=format&fit=crop&w=600&q=80",
    description: "Air laut menggenangi pekarangan tambak dan jalan desa pesisir.",
  },
];

export function WargaDashboardContent() {
  const [shareItem, setShareItem] = useState<AduanCardItem | null>(null);
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-5 max-w-4xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* 1. HERO BANNER KHUSUS DESKTOP (DI MOBILE SUDAH DI APP HEADER) */}
      {/* ============================================================ */}
      <div className="hidden md:block relative overflow-hidden bg-gradient-to-r from-[#38746D] via-[#2E6A63] to-[#1D443F] text-white rounded-3xl p-6 lg:p-8 shadow-sm">
        {/* Ornamen Geometri Abstrak Identik 100% dengan Halaman Auth & Header Mobile */}
        <AuthBackgroundDecor />

        <div className="relative z-10 flex items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-bold mb-3 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#1D443F] text-xs font-black shadow-md hover:bg-emerald-50 transition"
              >
                <ForkedRouteIcon className="w-4 h-4 shrink-0 text-[#1D443F]" />
                <span>Cek Rute Evakuasi Mandiri</span>
              </Link>
              <Link
                href="/warga/lapor"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition"
              >
                <BeaconAlertIcon className="w-4 h-4 shrink-0 text-white" />
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
            className="text-xs font-bold text-[#38746D] hover:underline flex items-center gap-0.5"
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
      {/* 3. CAROUSEL HORIZONTAL "PANTAUAN ADUAN TERVERIFIKASI"        */}
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
            className="text-xs font-bold text-[#38746D] hover:underline flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Container Carousel Horizontal (Scroll ke Samping dengan Snap Rapi Tanpa Terpotong) */}
        <div className="flex gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2.5 pt-0.5 px-0.5 scroll-pl-0.5 touch-pan-x">
          {/* Card Laporan 1 s.d. 4 */}
          {ADUAN_ITEMS.map((item) => (
            <div
              key={item.id}
              className="w-[260px] sm:w-[280px] shrink-0 snap-start rounded-2xl bg-white border border-[#38746D]/15 sm:border-slate-100 shadow-2xs hover:shadow-md transition-all p-3 flex flex-col justify-between"
            >
              <div>
                {/* Atas (Header Card) */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {/* Judul: misal Genangan 45 cm */}
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                      {item.condition}
                    </h3>
                    {/* Daerah: di bawah judul, font biasa bukan font judul */}
                    <p className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                      {item.location}
                    </p>
                  </div>

                  {/* Icon titik 3 untuk aksi bagikan */}
                  <button
                    type="button"
                    onClick={() => setShareItem(item)}
                    aria-label="Bagikan informasi laporan"
                    title="Bagikan"
                    className="w-7 h-7 -mr-1 -mt-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Tengah (Photo Report) */}
                <div className="relative w-full h-34 sm:h-36 rounded-xl overflow-hidden bg-slate-100 mt-2.5 group">
                  <img
                    src={item.photoUrl}
                    alt={`${item.condition} - ${item.location}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Status Validasi AI / Tim Terkonfirmasi di Pojok Kanan Atas Foto */}
                  {item.badgeType === "ai" && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shadow-xs">
                      <Sparkles className="w-2.5 h-2.5 shrink-0" />
                      <span>{item.badgeLabel}</span>
                    </span>
                  )}
                  {item.badgeType === "team" && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold shadow-xs">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                      <span>{item.badgeLabel}</span>
                    </span>
                  )}
                </div>

                {/* Bawah (Keterangan Ringkas) */}
                <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Footer Baris Bawah */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between">
                {/* Waktu di tempat bekas tiket */}
                <span className="text-xs font-normal text-slate-400">
                  {item.timeAgo}
                </span>
                {/* Tombol aksi: Selengkapnya */}
                <Link
                  href="/warga/aduan"
                  replace
                  scroll={false}
                  className="text-xs font-bold text-[#38746D] hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {/* Card ke-5 / Ujung Paling Kanan (Card "Selengkapnya") */}
          <Link
            href="/warga/aduan"
            replace
            scroll={false}
            className="w-[125px] sm:w-[135px] shrink-0 snap-start rounded-2xl bg-slate-50 border border-dashed border-slate-200 hover:border-[#38746D]/40 hover:bg-slate-100/90 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-[#38746D] group-hover:bg-[#24544E] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-700 mt-2.5 group-hover:text-[#1D443F] transition-colors">
              Selengkapnya
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Semua Laporan
            </span>
          </Link>
        </div>
      </section>
      </motion.div>

      {/* Modal / Card Bagikan Laporan (Muncul Saat Icon Titik 3 Diklik) */}
      {shareItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShareItem(null)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#38746D]/10 text-[#38746D] flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Bagikan Pantauan Banjir
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sebarkan informasi terkini ke warga sekitar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareItem(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ringkasan Laporan Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900">{shareItem.condition}</span>
                <span className="text-[11px] text-slate-400">{shareItem.timeAgo}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{shareItem.location}</p>
              <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed pt-0.5">
                &ldquo;{shareItem.description}&rdquo;
              </p>
            </div>

            {/* Tombol Aksi Bagikan */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🚨 *Pantauan Banjir DERMAYU*\n\n*Kondisi:* ${shareItem.condition}\n*Lokasi:* ${shareItem.location}\n*Waktu:* ${shareItem.timeAgo}\n*Keterangan:* ${shareItem.description}\n\nPantau situasi dan rute aman di aplikasi DERMAYU.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const shareText = `🚨 Pantauan Banjir DERMAYU: ${shareItem.condition} di ${shareItem.location} (${shareItem.timeAgo}). "${shareItem.description}". Pantau situasi di aplikasi DERMAYU.`;
                  navigator.clipboard.writeText(shareText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>Salin Info</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

