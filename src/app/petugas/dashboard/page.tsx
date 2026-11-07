"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
  Building2,
  Ship,
  Waves,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  PhoneCall,
  Activity,
  Send,
  Eye,
  Plus,
  Minus,
  Sparkles,
  ExternalLink,
  ClipboardList,
  Map,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Hero3DImage } from "@/components/dashboard/Hero3DImage";
import { AuthBackgroundDecor } from "@/components/auth/AuthBackgroundDecor";
import { PoskoShelterIcon } from "@/components/ui/Icons";
import { getActiveSession, clearUserSession, performLogout } from "@/utils/authSession";

interface UserSession {
  name: string;
  email: string;
  role: string;
  district: string;
}

interface CivicReport {
  id: string;
  ticketCode: string;
  timeReceived: string;
  reporterName: string;
  reporterPhone: string;
  location: string;
  district: string;
  disasterCategory: "Rob Pesisir" | "Luapan Cimanuk" | "Tanggul Kritis" | "Genangan Drainase";
  waterLevel: string;
  vulnerableCount: string; // e.g. "3 Lansia, 2 Balita"
  status: "MENUNGGU_VERIFIKASI" | "ARMADA_DIKERAHKAN" | "DITOLAK" | "SELESAI";
  notes?: string;
}

interface ShelterData {
  id: string;
  name: string;
  district: string;
  capacityTotal: number;
  capacityOccupied: number;
  logisticsStatus: "Aman" | "Menipis" | "Kritis";
  status: "TERSEDIA" | "HAMPIR_PENUH" | "PENUH";
}

export default function PetugasDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession>({
    name: "Komandan Surya BPBD",
    email: "petugas@dermayu.id",
    role: "petugas",
    district: "Pusdalops BPBD Indramayu",
  });

  const [currentTime, setCurrentTime] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const WEEKLY_TREND = [
    { day: "Sen", date: "1 Nov", total: 24, resolved: 20 },
    { day: "Sel", date: "2 Nov", total: 31, resolved: 28 },
    { day: "Rab", date: "3 Nov", total: 45, resolved: 40 },
    { day: "Kam", date: "4 Nov", total: 38, resolved: 35 },
    { day: "Jum", date: "5 Nov", total: 29, resolved: 26 },
    { day: "Sab", date: "6 Nov", total: 22, resolved: 19 },
    { day: "Min", date: "7 Nov", total: 18, resolved: 15 },
  ];

  // Triage Queue State
  const [reports, setReports] = useState<CivicReport[]>([
    {
      id: "rep-1",
      ticketCode: "DMY-20261030-0089",
      timeReceived: "13:05 WIB (5 mnt lalu)",
      reporterName: "Pak Kusnan",
      reporterPhone: "0812-9844-1120",
      location: "RT 04 / RW 02 Blok Karanganyar",
      district: "Kandanghaur (Eretan Wetan)",
      disasterCategory: "Rob Pesisir",
      waterLevel: "60 cm (Lutut Dewasa)",
      vulnerableCount: "3 Lansia, 2 Balita",
      status: "MENUNGGU_VERIFIKASI",
      notes: "Arus air masuk dari tanggul nelayan barat. Perahu karet dibutuhkan segera.",
    },
    {
      id: "rep-2",
      ticketCode: "DMY-20261030-0092",
      timeReceived: "12:48 WIB (22 mnt lalu)",
      reporterName: "Ibu Maryati",
      reporterPhone: "0857-3321-9981",
      location: "Depan SDN 2 Cantigi Kulon",
      district: "Cantigi",
      disasterCategory: "Luapan Cimanuk",
      waterLevel: "85 cm (Paha Dewasa)",
      vulnerableCount: "1 Balita & Ibu Hamil",
      status: "MENUNGGU_VERIFIKASI",
      notes: "Air rembes dari pintu air sekunder yang tersumbat eceng gondok.",
    },
    {
      id: "rep-3",
      ticketCode: "DMY-20261030-0084",
      timeReceived: "12:15 WIB (55 mnt lalu)",
      reporterName: "Budi Santoso",
      reporterPhone: "0813-2211-4450",
      location: "Jl. Kali Cimanuk Lama KM 4",
      district: "Sindang",
      disasterCategory: "Tanggul Kritis",
      waterLevel: "40 cm (Betis Dewasa)",
      vulnerableCount: "Tidak ada warga terjebak",
      status: "MENUNGGU_VERIFIKASI",
      notes: "Tanggul tanah mengalami retakan rembesan sepanjang 8 meter.",
    },
    {
      id: "rep-4",
      ticketCode: "DMY-20261030-0078",
      timeReceived: "11:20 WIB (2 jam lalu)",
      reporterName: "Wawan Sudrajat",
      reporterPhone: "0821-7788-0099",
      location: "Blok Karang Baru RT 01",
      district: "Losarang",
      disasterCategory: "Rob Pesisir",
      waterLevel: "70 cm (Paha)",
      vulnerableCount: "4 Lansia",
      status: "ARMADA_DIKERAHKAN",
      notes: "Tim SAR Unit 2 bersama 1 LCR telah tiba dan mengevakuasi warga ke GOR.",
    },
  ]);

  // Shelter Capacity Data State
  const [shelters, setShelters] = useState<ShelterData[]>([
    {
      id: "sh-1",
      name: "Balai Desa Eretan Wetan",
      district: "Kecamatan Kandanghaur",
      capacityTotal: 250,
      capacityOccupied: 185,
      logisticsStatus: "Aman",
      status: "TERSEDIA",
    },
    {
      id: "sh-2",
      name: "GOR Kandanghaur",
      district: "Kecamatan Kandanghaur",
      capacityTotal: 500,
      capacityOccupied: 310,
      logisticsStatus: "Aman",
      status: "TERSEDIA",
    },
    {
      id: "sh-3",
      name: "SMPN 1 Cantigi",
      district: "Kecamatan Cantigi",
      capacityTotal: 200,
      capacityOccupied: 190,
      logisticsStatus: "Menipis",
      status: "HAMPIR_PENUH",
    },
    {
      id: "sh-4",
      name: "Balai Desa Sindang",
      district: "Kecamatan Sindang",
      capacityTotal: 150,
      capacityOccupied: 40,
      logisticsStatus: "Aman",
      status: "TERSEDIA",
    },
  ]);

  useEffect(() => {
    try {
      const active = getActiveSession();
      if (active) {
        setSession({
          name: active.name,
          email: active.email,
          role: active.role,
          district: active.district || "Pusdalops BPBD Indramayu",
        });
      }
    } catch {
      // Keep default session
    }

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    performLogout("/login");
  };

  // Triage Action Handlers
  const handleVerifyAndDispatch = (reportId: string, ticketCode: string) => {
    setReports((prev) =>
      prev.map((rep) =>
        rep.id === reportId ? { ...rep, status: "ARMADA_DIKERAHKAN" } : rep
      )
    );
    setActionSuccessMsg(
      `Tiket #${ticketCode} berhasil diverifikasi! Perintah tugas diteruskan ke Regu SAR Lapangan.`
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleResolveReport = (reportId: string, ticketCode: string) => {
    setReports((prev) =>
      prev.map((rep) =>
        rep.id === reportId ? { ...rep, status: "SELESAI" } : rep
      )
    );
    setActionSuccessMsg(
      `Tiket #${ticketCode} berhasil diselesaikan! Catatan penanganan petugas telah dicatat.`
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleRejectReport = (reportId: string, ticketCode: string) => {
    const reason = prompt(
      `Masukkan alasan penolakan untuk tiket #${ticketCode} (Wajib sesuai spesifikasi PRD):`,
      "Foto tidak relevan / laporan duplikat"
    );
    if (reason) {
      setReports((prev) =>
        prev.map((rep) => (rep.id === reportId ? { ...rep, status: "DITOLAK", notes: `Alasan penolakan: ${reason}` } : rep))
      );
      setActionSuccessMsg(`Tiket #${ticketCode} ditolak dengan alasan: ${reason}`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  // Shelter Occupancy Adjuster
  const updateOccupancy = (shelterId: string, delta: number) => {
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id !== shelterId) return s;
        const newOcc = Math.max(0, Math.min(s.capacityTotal, s.capacityOccupied + delta));
        const percent = (newOcc / s.capacityTotal) * 100;
        const newStatus = percent >= 95 ? "PENUH" : percent >= 80 ? "HAMPIR_PENUH" : "TERSEDIA";
        return {
          ...s,
          capacityOccupied: newOcc,
          status: newStatus,
        };
      })
    );
  };

  // Filtered reports
  const pendingCount = reports.filter((r) => r.status === "MENUNGGU_VERIFIKASI").length;
  const dispatchedCount = reports.filter((r) => r.status === "ARMADA_DIKERAHKAN").length;

  const filteredReports = reports.filter((r) => {
    const matchCat = filterCategory === "Semua" || r.disasterCategory === filterCategory;
    const matchSearch =
      r.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-5 text-left max-w-5xl mx-auto w-full min-w-0">
      {/* 1. HERO BANNER KHUSUS DESKTOP (DI MOBILE SUDAH MENYATU DENGAN APP HEADER) */}
      <div className="hidden md:block relative overflow-hidden bg-gradient-to-r from-[#38746D] via-[#2E6A63] to-[#1D443F] text-white rounded-3xl p-6 lg:p-8 shadow-sm">
        <AuthBackgroundDecor />

        <div className="relative z-10 flex items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-bold mb-3 border border-white/15">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>Pusat Kendali (PUSDALOPS) Indramayu</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight leading-snug">
              PUSAT KENDALI OPERASI (PUSDALOPS)
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
              Pantau laporan masuk, kerahkan armada SAR, dan kelola kapasitas posko evakuasi.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/petugas/peta-sar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#1D443F] text-xs font-black shadow-md hover:bg-emerald-50 transition active:scale-95"
              >
                <MapPin className="w-4 h-4 shrink-0 text-[#1D443F]" />
                <span>Peta SAR &amp; Evakuasi</span>
              </Link>
              <Link
                href="/petugas/triage"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-transparent border border-white/80 hover:bg-white/10 text-white text-xs font-bold transition active:scale-95"
              >
                <ClipboardList className="w-4 h-4 shrink-0 text-white" />
                <span>Antrean Triage</span>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block shrink-0">
            <Hero3DImage className="w-44 h-44" />
          </div>
        </div>
      </div>

      {/* Banner Alert Sukses Tindakan */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMsg(null)}
            className="text-xs text-emerald-700 underline font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. KONTEN METRIK OPERASIONAL PETUGAS (FLOATING OVER HERO) */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-4 sm:space-y-4 -mt-8 sm:-mt-10 md:mt-0 relative z-10"
      >
        {/* SECTION AKSES CEPAT OPERASIONAL (GRID MENU DIADAPTASI DARI DASBOR WARGA) */}
        <section aria-label="Akses Cepat Operasional" className="pt-2 sm:pt-0">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight">
              Akses Cepat Operasional
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Card 1: Peta Spasial & SAR */}
            <Link
              href="/petugas/peta-sar"
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#E8F1EE] shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[105px] sm:min-h-[115px] hover:border-[#38746D] hover:shadow-md transition-all group cursor-pointer active:scale-[0.98]"
            >
              {/* Pattern Ornament Top-Right (Belah Ketupat) */}
              <svg
                className="absolute -top-1 -right-1 w-16 h-16 sm:w-18 sm:h-18 text-[#38746D]/12 pointer-events-none group-hover:text-[#38746D]/22 group-hover:scale-105 transition-all duration-300"
                viewBox="0 0 64 64"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="32.25" y="3.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 11)" />
                <rect x="45.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 53 24)" />
                <rect x="32.25" y="29.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 37)" />
                <rect x="19.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 27 24)" />
              </svg>

              {/* Icon Container Kiri Atas */}
              <div className="w-10 h-10 rounded-xl bg-[#38746D]/10 text-[#38746D] border border-[#38746D]/15 group-hover:bg-[#38746D] group-hover:text-white group-hover:border-[#38746D] flex items-center justify-center shrink-0 transition-all duration-200">
                <Map className="w-5 h-5 transition-colors text-[#38746D] group-hover:text-white" />
              </div>

              {/* Label Kiri Bawah */}
              <div className="mt-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#1D443F] leading-snug line-clamp-2">
                  Peta Spasial &amp; SAR
                </h3>
              </div>
            </Link>

            {/* Card 2: Triage & Verifikasi Aduan */}
            <Link
              href="/petugas/triage"
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#E8F1EE] shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[105px] sm:min-h-[115px] hover:border-[#38746D] hover:shadow-md transition-all group cursor-pointer active:scale-[0.98]"
            >
              {/* Pattern Ornament Top-Right (Concentric Circles) */}
              <svg
                className="absolute -top-1 -right-1 w-16 h-16 sm:w-18 sm:h-18 text-[#38746D]/12 pointer-events-none group-hover:text-[#38746D]/22 group-hover:scale-105 transition-all duration-300"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle cx="53" cy="11" r="15" strokeWidth="8" />
                <circle cx="53" cy="11" r="29" strokeWidth="4.2" opacity="0.85" />
              </svg>

              {/* Icon Container Kiri Atas */}
              <div className="w-10 h-10 rounded-xl bg-[#38746D]/10 text-[#38746D] border border-[#38746D]/15 group-hover:bg-[#38746D] group-hover:text-white group-hover:border-[#38746D] flex items-center justify-center shrink-0 transition-all duration-200">
                <ClipboardList className="w-5 h-5 transition-colors text-[#38746D] group-hover:text-white" />
              </div>

              {/* Label Kiri Bawah */}
              <div className="mt-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#1D443F] leading-snug line-clamp-2">
                  Triage &amp; Verifikasi Aduan
                </h3>
              </div>
            </Link>

            {/* Card 3: Manajemen Posko */}
            <Link
              href="/petugas/posko"
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#E8F1EE] shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[105px] sm:min-h-[115px] hover:border-[#38746D] hover:shadow-md transition-all group cursor-pointer active:scale-[0.98]"
            >
              {/* Pattern Ornament Top-Right (Belah Ketupat) */}
              <svg
                className="absolute -top-1 -right-1 w-16 h-16 sm:w-18 sm:h-18 text-[#38746D]/12 pointer-events-none group-hover:text-[#38746D]/22 group-hover:scale-105 transition-all duration-300"
                viewBox="0 0 64 64"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="32.25" y="3.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 11)" />
                <rect x="45.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 53 24)" />
                <rect x="32.25" y="29.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 37)" />
                <rect x="19.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 27 24)" />
              </svg>

              {/* Icon Container Kiri Atas */}
              <div className="w-10 h-10 rounded-xl bg-[#38746D]/10 text-[#38746D] border border-[#38746D]/15 group-hover:bg-[#38746D] group-hover:text-white group-hover:border-[#38746D] flex items-center justify-center shrink-0 transition-all duration-200">
                <PoskoShelterIcon className="w-5 h-5 transition-colors text-[#38746D] group-hover:text-white" />
              </div>

              {/* Label Kiri Bawah */}
              <div className="mt-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#1D443F] leading-snug line-clamp-2">
                  Manajemen Posko
                </h3>
              </div>
            </Link>

            {/* Card 4: Telemetri TMA & Rob */}
            <Link
              href="/petugas/telemetri"
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#E8F1EE] shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[105px] sm:min-h-[115px] hover:border-[#38746D] hover:shadow-md transition-all group cursor-pointer active:scale-[0.98]"
            >
              {/* Pattern Ornament Top-Right (Concentric Circles) */}
              <svg
                className="absolute -top-1 -right-1 w-16 h-16 sm:w-18 sm:h-18 text-[#38746D]/12 pointer-events-none group-hover:text-[#38746D]/22 group-hover:scale-105 transition-all duration-300"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle cx="53" cy="11" r="15" strokeWidth="8" />
                <circle cx="53" cy="11" r="29" strokeWidth="4.2" opacity="0.85" />
              </svg>

              {/* Icon Container Kiri Atas */}
              <div className="w-10 h-10 rounded-xl bg-[#38746D]/10 text-[#38746D] border border-[#38746D]/15 group-hover:bg-[#38746D] group-hover:text-white group-hover:border-[#38746D] flex items-center justify-center shrink-0 transition-all duration-200">
                <Activity className="w-5 h-5 transition-colors text-[#38746D] group-hover:text-white" />
              </div>

              {/* Label Kiri Bawah */}
              <div className="mt-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#1D443F] leading-snug line-clamp-2">
                  Telemetri TMA &amp; Rob
                </h3>
              </div>
            </Link>

            {/* Card 5: Komunitas */}
            <Link
              href="/petugas/komunitas"
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#E8F1EE] shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[105px] sm:min-h-[115px] hover:border-[#38746D] hover:shadow-md transition-all group cursor-pointer active:scale-[0.98]"
            >
              {/* Pattern Ornament Top-Right (Belah Ketupat) */}
              <svg
                className="absolute -top-1 -right-1 w-16 h-16 sm:w-18 sm:h-18 text-[#38746D]/12 pointer-events-none group-hover:text-[#38746D]/22 group-hover:scale-105 transition-all duration-300"
                viewBox="0 0 64 64"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="32.25" y="3.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 11)" />
                <rect x="45.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 53 24)" />
                <rect x="32.25" y="29.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 40 37)" />
                <rect x="19.25" y="16.25" width="15.5" height="15.5" rx="3.5" transform="rotate(45 27 24)" />
              </svg>

              {/* Icon Container Kiri Atas */}
              <div className="w-10 h-10 rounded-xl bg-[#38746D]/10 text-[#38746D] border border-[#38746D]/15 group-hover:bg-[#38746D] group-hover:text-white group-hover:border-[#38746D] flex items-center justify-center shrink-0 transition-all duration-200">
                <Users className="w-5 h-5 transition-colors text-[#38746D] group-hover:text-white" />
              </div>

              {/* Label Kiri Bawah */}
              <div className="mt-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#1D443F] leading-snug line-clamp-2">
                  Komunitas
                </h3>
              </div>
            </Link>
          </div>
        </section>

        {/* MODUL 1: 4 TOP KPI CARDS */}
        <section aria-label="Ringkasan Indikator Kunci (KPI)" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* KPI 1: Laporan Hari Ini */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 flex flex-col justify-between hover:border-[#38746D]/40 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4B635F] uppercase tracking-wider">
                Laporan Masuk (Hari Ini)
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#132422]">18</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {pendingCount} Antrean
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {dispatchedCount} Armada Dikerahkan
              </p>
            </div>
          </div>

          {/* KPI 2: Posko Aktif */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 flex flex-col justify-between hover:border-[#38746D]/40 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4B635F] uppercase tracking-wider">
                Posko Terpadu Aktif
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EEF5F3] text-[#38746D] border border-[#A4C6C1]/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#132422]">14</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#38746D] bg-[#EEF5F3] px-2 py-0.5 rounded-full border border-[#A4C6C1]/50">
                  Rata-rata 64%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                1.425 Jiwa Tertampung
              </p>
            </div>
          </div>

          {/* KPI 3: Total Pengungsi */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 flex flex-col justify-between hover:border-[#38746D]/40 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4B635F] uppercase tracking-wider">
                Warga Terdampak
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#132422]">1.425</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5 inline" /> +12%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                Kec. Cantigi &amp; Sindang Tertinggi
              </p>
            </div>
          </div>

          {/* KPI 4: Armada Siaga */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 flex flex-col justify-between hover:border-[#38746D]/40 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4B635F] uppercase tracking-wider">
                Armada SAR Siaga
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Ship className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#132422]">8 Unit</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  5 Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                3 Unit Cadangan di Mako Pusdalops
              </p>
            </div>
          </div>
        </section>

        {/* MODUL 2 & 3: DUA GRAFIK UTAMA BERDAMPINGAN (2/3 BAR CHART & 1/3 DOUGHNUT CHART) */}
        <section aria-label="Analitik Laporan dan Okupansi Posko" className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* KIRI (LEBAR 2/3): BAR CHART TREN LAPORAN 7 HARI TERAKHIR */}
          <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header Grafik */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#132422] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#38746D]" />
                    Tren Laporan 7 Hari Terakhir
                  </h2>
                  <p className="text-xs text-[#4B635F] mt-0.5">
                    Perbandingan volume aduan masuk dengan laporan yang berhasil ditangani tim SAR.
                  </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-xs self-start sm:self-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38746D]" />
                    <span className="text-[11px] font-semibold text-slate-600">Total Aduan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A4C6C1]" />
                    <span className="text-[11px] font-semibold text-slate-600">Selesai Ditangani</span>
                  </div>
                </div>
              </div>

              {/* Area Grafik Bar Chart Interaktif */}
              <div className="mt-6 relative">
                {/* Garis Horizontal Grid & Skala Y */}
                <div className="h-52 w-full flex flex-col justify-between text-[10px] text-slate-400 font-mono pointer-events-none select-none">
                  <div className="flex items-center w-full">
                    <span className="w-6 text-right pr-2 shrink-0">50</span>
                    <div className="w-full border-t border-dashed border-slate-200/80" />
                  </div>
                  <div className="flex items-center w-full">
                    <span className="w-6 text-right pr-2 shrink-0">35</span>
                    <div className="w-full border-t border-dashed border-slate-200/80" />
                  </div>
                  <div className="flex items-center w-full">
                    <span className="w-6 text-right pr-2 shrink-0">20</span>
                    <div className="w-full border-t border-dashed border-slate-200/80" />
                  </div>
                  <div className="flex items-center w-full">
                    <span className="w-6 text-right pr-2 shrink-0">0</span>
                    <div className="w-full border-t border-slate-300" />
                  </div>
                </div>

                {/* Bars Container */}
                <div className="absolute inset-x-0 bottom-6 top-0 pl-7 pr-2 flex items-end justify-between gap-2 sm:gap-4">
                  {WEEKLY_TREND.map((item, idx) => {
                    const maxVal = 50;
                    const totalHeight = (item.total / maxVal) * 100;
                    const resolvedHeight = (item.resolved / maxVal) * 100;
                    const isHovered = hoveredBarIndex === idx;

                    return (
                      <div
                        key={item.day}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      >
                        {/* Tooltip Hover */}
                        {isHovered && (
                          <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                            <div className="font-bold text-[#A4C6C1]">{item.date}</div>
                            <div>Masuk: {item.total} &bull; Selesai: {item.resolved}</div>
                          </div>
                        )}

                        {/* Bar Pairs */}
                        <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full pb-0.5">
                          {/* Bar Total Laporan */}
                          <div
                            className={`w-3 sm:w-4 rounded-t-sm transition-all duration-300 ${
                              isHovered ? "bg-[#25504B] shadow-md scale-y-[1.02]" : "bg-[#38746D]"
                            }`}
                            style={{ height: `${totalHeight}%` }}
                            title={`Total Laporan: ${item.total}`}
                          />

                          {/* Bar Selesai Ditangani */}
                          <div
                            className={`w-3 sm:w-4 rounded-t-sm transition-all duration-300 ${
                              isHovered ? "bg-[#7AA6A0] shadow-md scale-y-[1.02]" : "bg-[#A4C6C1]"
                            }`}
                            style={{ height: `${resolvedHeight}%` }}
                            title={`Selesai Ditangani: ${item.resolved}`}
                          />
                        </div>

                        {/* Label Hari */}
                        <span
                          className={`text-[10px] sm:text-xs font-semibold mt-2 transition-colors ${
                            isHovered ? "text-[#38746D] font-bold" : "text-slate-500"
                          }`}
                        >
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Insight */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#4B635F]">
              <span className="text-[11px] sm:text-xs">
                Rata-rata <strong>29 aduan/hari</strong> &bull; Puncak aduan pada <strong>Rabu (45 aduan)</strong>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                87% Tingkat Selesai
              </span>
            </div>
          </div>

          {/* KANAN (LEBAR 1/3): DOUGHNUT CHART RASIO KAPASITAS POSKO GLOBAL */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-extrabold text-[#132422] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#38746D]" />
                  Rasio Okupansi Posko
                </h2>
                <p className="text-xs text-[#4B635F] mt-0.5">
                  Kapasitas global dari 14 posko terpadu aktif se-Kabupaten.
                </p>
              </div>

              {/* Doughnut SVG Container */}
              <div className="relative flex items-center justify-center my-6">
                <svg className="w-40 h-40 sm:w-44 sm:h-44 -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track (Sisa Kuota - 36%) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="transparent"
                    stroke="#E8F1EE"
                    strokeWidth="20"
                  />
                  {/* Active Arc (Terisi - 64%) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="transparent"
                    stroke="#38746D"
                    strokeWidth="20"
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={(2 * Math.PI * 62) * (1 - 0.64)}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Inner Text Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl sm:text-4xl font-black text-[#132422] tracking-tight">
                    64%
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B635F]">
                    Terisi
                  </span>
                </div>
              </div>

              {/* Rincian Angka */}
              <div className="space-y-2 bg-[#F8FAF9] p-3 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38746D]" />
                    <span className="text-slate-600">Pengungsi Terdata</span>
                  </div>
                  <span className="font-bold text-[#132422]">1.425 Jiwa</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D5E4E0]" />
                    <span className="text-slate-600">Sisa Kuota Ruang</span>
                  </div>
                  <span className="font-bold text-[#132422]">800 Jiwa</span>
                </div>

                <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between font-semibold text-slate-800">
                  <span>Total Daya Tampung</span>
                  <span>2.225 Jiwa</span>
                </div>
              </div>
            </div>

            {/* Status Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-2 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Kondisi Okupansi Aman
                </span>
                <Link
                  href="/petugas/posko"
                  className="text-[#38746D] hover:underline font-extrabold flex items-center gap-0.5"
                >
                  Kelola <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MODUL 4: COMPACT ANTREAN TRIAGE (MAX 3 ROWS) & PERINGATAN HIDROLOGI */}
        <section aria-label="Tindakan Operasional Segera" className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* KIRI (LEBAR 2/3): COMPACT ANTREAN TRIAGE DARURAT */}
          <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            {/* Header dengan Tombol Lihat Semua */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-[#132422]">
                    Antrean Triage Darurat
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    {pendingCount} Prioritas
                  </span>
                </div>
                <p className="text-xs text-[#4B635F] mt-0.5">
                  Laporan warga berkategori darurat yang belum ditugaskan regu penyelamat.
                </p>
              </div>

              <Link
                href="/petugas/triage"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EEF5F3] hover:bg-[#38746D] text-[#38746D] hover:text-white border border-[#A4C6C1]/50 text-xs font-bold transition-all shadow-2xs"
              >
                <span>Lihat Semua ({reports.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Compact List (Maksimal 3 Baris) */}
            <div className="space-y-2.5">
              {reports.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-xl sm:rounded-2xl bg-[#F8FAF9] hover:bg-white border border-slate-200 hover:border-[#38746D]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Info Kiri */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-[#38746D]">
                        #{rep.ticketCode}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {rep.waterLevel}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        &bull; {rep.timeReceived}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#132422]">
                      <span className="font-bold truncate">{rep.reporterName}</span>
                      <span className="text-slate-400">&bull;</span>
                      <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
                      <span className="text-slate-600 truncate">{rep.district} ({rep.location})</span>
                    </div>

                    {rep.vulnerableCount && (
                      <p className="text-[10px] text-amber-800 font-medium">
                        Rentan: <strong>{rep.vulnerableCount}</strong>
                      </p>
                    )}
                  </div>

                  {/* Aksi Kanan */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {rep.status === "MENUNGGU_VERIFIKASI" ? (
                      <button
                        type="button"
                        onClick={() => handleVerifyAndDispatch(rep.id, rep.ticketCode)}
                        className="px-3 py-1.5 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Kirim Tim SAR</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                        Armada Meluncur
                      </span>
                    )}

                    <Link
                      href="/petugas/triage"
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#38746D] hover:bg-white text-xs transition-colors"
                      title="Buka detail laporan di Triage"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KANAN (LEBAR 1/3): TELEMETRI TMA & PERINGATAN HIDROLOGI */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                    <Waves className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-[#132422]">
                    Status Hidrologi &amp; TMA
                  </h2>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">
                  Siaga II
                </span>
              </div>

              {/* Status Points */}
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                    <span>Bendung Rentang</span>
                    <span className="bg-rose-200/80 px-2 py-0.5 rounded text-[10px]">TMA 485 cm</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-tight">
                    Debit air kiriman hulu meningkat. Status Siaga II aktif sejak pukul 11:30 WIB.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>Sensor Rob Eretan Wetan</span>
                    <span className="bg-amber-200/80 px-2 py-0.5 rounded text-[10px]">+65 cm Rob</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-tight">
                    Pasang air laut diprediksi memuncak pada pukul 17:00 WIB.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/petugas/telemetri"
              className="w-full py-2.5 px-3 rounded-xl bg-[#EEF5F3] hover:bg-[#38746D] text-[#38746D] hover:text-white border border-[#A4C6C1]/50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs group"
            >
              <span>Buka Telemetri &amp; EWS Lengkap</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </section>
      </motion.div>
    </div>
  );
}

