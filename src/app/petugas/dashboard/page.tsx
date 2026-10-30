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
} from "lucide-react";
import { getActiveSession, clearUserSession } from "@/utils/authSession";

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
    clearUserSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
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
    <div className="space-y-7 text-left">
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

        {/* A. 4 METRIK OPERASIONAL LAPANGAN (METRIC CARDS) */}
        <section id="telemetri" aria-label="Metrik Operasional" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 scroll-mt-24">
          {/* Metrik 1: Antrean Aduan Masuk */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4B635F] uppercase tracking-wider">Aduan Hari Ini</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#132422]">18 Laporan</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {pendingCount} Antrean
                </span>
              </div>
              <p className="text-xs text-[#718783] mt-1">
                {dispatchedCount} Armada Dikerahkan &bull; 12 Selesai Ditangani
              </p>
            </div>
          </div>

          {/* Metrik 2: Posko Pengungsian & Okupansi */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4B635F] uppercase tracking-wider">Posko Pengungsian</span>
              <div className="w-9 h-9 rounded-xl bg-[#EEF5F3] text-[#38746D] border border-[#A4C6C1]/50 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#132422]">14 Posko</span>
                <span className="text-xs font-bold text-[#38746D] bg-[#EEF5F3] px-2 py-0.5 rounded-full border border-[#A4C6C1]/50">
                  Rata-rata 64%
                </span>
              </div>
              <p className="text-xs text-[#718783] mt-1">
                Total 1.425 Jiwa Tertampung &bull; 4 Titik Siaga 1
              </p>
            </div>
          </div>

          {/* Metrik 3: Armada Penyelamat / SAR */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4B635F] uppercase tracking-wider">Armada Siaga</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                <Ship className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#132422]">8 Unit LCR</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  5 Aktif di Air
                </span>
              </div>
              <p className="text-xs text-[#718783] mt-1">
                3 Perahu Karet Cadangan di Mako Pusdalops
              </p>
            </div>
          </div>

          {/* Metrik 4: Status TMA Hulu & Rob Pesisir */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4B635F] uppercase tracking-wider">Debit &amp; Pasang Laut</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                <Waves className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-rose-700">SIAGA II</span>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  TMA 485 cm
                </span>
              </div>
              <p className="text-xs text-[#718783] mt-1">
                Hulu Rentang Naik &bull; Pasang Rob Puncak Pk 17:00
              </p>
            </div>
          </div>
        </section>

        {/* B. TABEL TRIAGE & VERIFIKASI ADUAN WARGA (CIVIC REPORTING QUEUE) */}
        <section
          id="triage"
          aria-label="Triage Antrean Pelaporan"
          className="bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-7 shadow-xs space-y-5 scroll-mt-24"
        >
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#132422]">
                  Antrean Triage &amp; Verifikasi Aduan Warga
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {pendingCount} Perlu Ditinjau
                </span>
              </div>
              <p className="text-xs text-[#4B635F] mt-0.5">
                Triage cepat aduan masuk, verifikasi koordinat lapangan, dan kerahkan armada tim penyelamat.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari pelapor / tiket / lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3.5 py-2 rounded-xl bg-[#F8FAF9] border border-[#D5E4E0] text-xs text-[#132422] outline-none focus:border-[#38746D] w-56 sm:w-64"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F8FAF9] border border-[#D5E4E0] text-xs font-semibold text-[#132422] outline-none focus:border-[#38746D] cursor-pointer"
              >
                <option value="Semua">Semua Kategori Bencana</option>
                <option value="Rob Pesisir">Rob Pesisir</option>
                <option value="Luapan Cimanuk">Luapan Cimanuk</option>
                <option value="Tanggul Kritis">Tanggul Kritis</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-[#D5E4E0]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#EEF5F3] border-b border-[#D5E4E0] text-[#132422] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tiket &amp; Waktu</th>
                  <th className="py-3 px-4">Pelapor &amp; Kontak</th>
                  <th className="py-3 px-4">Titik Lokasi &amp; Kecamatan</th>
                  <th className="py-3 px-4">Kategori &amp; Ketinggian</th>
                  <th className="py-3 px-4">Korban Rentan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8F1EE] bg-white">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Tidak ada antrean laporan yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAF9] transition-colors">
                      {/* 1. Tiket & Waktu */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#132422] whitespace-nowrap">
                        <div className="font-extrabold text-[#38746D]">#{item.ticketCode}</div>
                        <div className="text-[10px] text-gray-500 font-sans font-normal mt-0.5">{item.timeReceived}</div>
                      </td>

                      {/* 2. Pelapor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#132422]">{item.reporterName}</div>
                        <a
                          href={`tel:${item.reporterPhone}`}
                          className="text-[11px] text-[#38746D] hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{item.reporterPhone}</span>
                        </a>
                      </td>

                      {/* 3. Lokasi */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-[#132422] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                          <span className="truncate">{item.district}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 truncate">{item.location}</div>
                        {item.notes && (
                          <div className="text-[10px] text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 mt-1 border border-amber-200">
                            Ket: {item.notes}
                          </div>
                        )}
                      </td>

                      {/* 4. Kategori & Air */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF5F3] text-[#38746D] border border-[#A4C6C1]/50 mb-1">
                          {item.disasterCategory}
                        </span>
                        <div className="font-bold text-rose-700">{item.waterLevel}</div>
                      </td>

                      {/* 5. Korban Rentan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg inline-block">
                          {item.vulnerableCount}
                        </div>
                      </td>

                      {/* 6. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            item.status === "ARMADA_DIKERAHKAN"
                              ? "bg-purple-100 text-purple-900 border border-purple-200"
                              : item.status === "SELESAI"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : item.status === "DITOLAK"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                          }`}
                        >
                          {item.status === "ARMADA_DIKERAHKAN"
                            ? "Armada Dikerahkan"
                            : item.status === "SELESAI"
                            ? "Selesai Ditangani"
                            : item.status === "DITOLAK"
                            ? "Laporan Ditolak"
                            : "Menunggu Verifikasi"}
                        </span>
                      </td>

                      {/* 7. Aksi (PRD FR-OPS-02 & FR-ADM-04) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {item.status === "MENUNGGU_VERIFIKASI" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleVerifyAndDispatch(item.id, item.ticketCode)}
                              className="px-3 py-1.5 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                              title="Verifikasi data dan kirim armada tim SAR"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verifikasi &amp; Kirim Tim</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRejectReport(item.id, item.ticketCode)}
                              className="px-2.5 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-[11px] transition-colors cursor-pointer"
                              title="Tolak laporan dengan alasan wajib (PRD FR-ADM-04)"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : item.status === "ARMADA_DIKERAHKAN" ? (
                          <button
                            type="button"
                            onClick={() => handleResolveReport(item.id, item.ticketCode)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                            title="Tandai evakuasi atau penanganan telah selesai (PRD FR-OPS-02)"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tandai Selesai</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic font-medium">Selesai Diproses</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* C. RINGKASAN CEPAT MANAJEMEN KAPASITAS POSKO (SHELTER TRACKER) */}
        <section
          id="posko"
          aria-label="Manajemen Kapasitas Posko"
          className="bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-7 shadow-xs space-y-5 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#132422] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#38746D]" />
                Manajemen Kapasitas &amp; Okupansi Posko Terpadu
              </h2>
              <p className="text-xs text-[#4B635F] mt-0.5">
                Perbarui jumlah warga pengungsi yang masuk atau keluar secara instan dari lapangan.
              </p>
            </div>
            <span className="text-xs font-bold text-[#38746D] bg-[#EEF5F3] border border-[#A4C6C1]/50 px-3 py-1.5 rounded-full">
              4 Posko Terpantau Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {shelters.map((sh) => {
              const remaining = sh.capacityTotal - sh.capacityOccupied;
              const percent = Math.round((sh.capacityOccupied / sh.capacityTotal) * 100);

              return (
                <div
                  key={sh.id}
                  className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] hover:border-[#38746D] transition-colors space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-sm text-[#132422] leading-tight">{sh.name}</h3>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          sh.status === "PENUH"
                            ? "bg-rose-100 text-rose-800"
                            : sh.status === "HAMPIR_PENUH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {sh.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#718783]">{sh.district}</p>
                  </div>

                  {/* Progress Bar Okupansi */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Terisi: <strong>{sh.capacityOccupied}</strong> / {sh.capacityTotal}</span>
                      <span className="font-bold text-[#132422]">{percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          percent >= 90 ? "bg-rose-600" : percent >= 75 ? "bg-amber-500" : "bg-[#38746D]"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">Sisa Kuota: <strong>{remaining} Jiwa</strong></p>
                  </div>

                  {/* Quick Adjust Buttons */}
                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#4B635F]">Update Pengungsi:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateOccupancy(sh.id, -5)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#D5E4E0] hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 cursor-pointer"
                        title="Kurangi 5 orang"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOccupancy(sh.id, 5)}
                        className="w-7 h-7 rounded-lg bg-[#38746D] hover:bg-[#24544E] text-white flex items-center justify-center text-xs font-bold shadow-2xs cursor-pointer"
                        title="Tambah 5 orang masuk"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
  );
}

