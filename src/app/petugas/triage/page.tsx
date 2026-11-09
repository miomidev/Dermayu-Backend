"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  PhoneCall,
  Ship,
  ExternalLink,
  ChevronRight,
  Send,
  AlertTriangle,
  X,
  FileText,
  RefreshCw,
  Inbox,
  ShieldCheck,
} from "lucide-react";

interface CivicReport {
  id: string;
  ticketCode: string;
  timeReceived: string;
  reporterName: string;
  reporterPhone: string;
  location: string;
  district: string;
  waterLevel: string;
  disasterCategory: string;
  severity: "TINGGI" | "SEDANG" | "RENDAH";
  status: "SUBMITTED" | "VERIFIED" | "ARMADA_DIKERAHKAN" | "SELESAI" | "DITOLAK";
  vulnerableCount: { elderly: number; children: number; sick: number };
  aiConfidence: number;
  aiClassification: string;
  description: string;
  photoUrl: string;
  photos?: string[];
  rejectionReason?: string;
  assignedUnit?: string;
  lat?: number;
  lng?: number;
}

const STORAGE_KEY = "dermayu_user_reports_v2";

export default function PetugasTriagePage() {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Fungsi sinkronisasi data dari Server API dan LocalStorage
  const loadReports = useCallback(async () => {
    try {
      // 1. Fetch dari Server API
      let serverReports: CivicReport[] = [];
      try {
        const res = await fetch("/api/laporan?type=citizen", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const list = json.data?.data || json.data || [];
          if (Array.isArray(list)) {
            serverReports = list.map((item: any) => ({
              id: item.id || item.ticketCode,
              ticketCode: item.ticketCode || item.id,
              timeReceived: item.timeReceived || "Hari ini",
              reporterName: item.reporterName || "Warga Siaga",
              reporterPhone: item.reporterPhone || "0812-XXXX-XXXX",
              location: item.location || "Indramayu",
              district: item.district || "Indramayu",
              waterLevel: item.waterLevel || "Genangan Air",
              disasterCategory: item.disasterCategory || "Banjir / Rob Pesisir",
              severity: item.severity || "SEDANG",
              status: item.status || "SUBMITTED",
              vulnerableCount: item.vulnerableCount || { elderly: 0, children: 0, sick: 0 },
              aiConfidence: item.aiConfidence || 85,
              aiClassification: item.aiClassification || "Banjir Terverifikasi AI",
              description: item.description || "Laporan dari warga siaga.",
              photoUrl: item.photoUrl || (item.photos && item.photos[0]) || "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
              photos: item.photos || (item.photoUrl ? [item.photoUrl] : []),
              rejectionReason: item.rejectionReason,
              assignedUnit: item.assignedUnit,
              lat: item.lat,
              lng: item.lng,
            }));
          }
          // Server API adalah single source of truth untuk Petugas Pusdalops
          setReports(serverReports);
          return;
        }
      } catch (err) {
        console.warn("Gagal memuat aduan dari server API, mencoba fallback lokal:", err);
      }

      // 2. Fallback baca dari LocalStorage HANYA jika server API offline/tidak dapat dihubungi
      let localReports: CivicReport[] = [];
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            localReports = parsed
              .filter((r: any) => r.id !== "DMY-20261102-8912" && r.id !== "DMY-20261101-7421")
              .map((r: any) => {
                const confRaw = r.aiConfidence ?? (r.aiScore?.confidence ? r.aiScore.confidence * 100 : 85);
                const conf = confRaw <= 1 ? Math.round(confRaw * 100 * 10) / 10 : confRaw;
                const isAuto = conf > 60 || r.status === "DIVERIFIKASI";
                const mappedStatus: CivicReport["status"] =
                  r.status === "PENANGANAN"
                    ? "ARMADA_DIKERAHKAN"
                    : r.status === "SELESAI"
                    ? "SELESAI"
                    : r.status === "DITOLAK"
                    ? "DITOLAK"
                    : isAuto
                    ? "VERIFIED"
                    : "SUBMITTED";

                return {
                  id: r.id,
                  ticketCode: r.id,
                  timeReceived: r.time || "Hari ini",
                  reporterName: "Warga Siaga (Pelapor)",
                  reporterPhone: "0812-XXXX-XXXX",
                  location: r.location || "Indramayu",
                  district: "Indramayu",
                  waterLevel: r.waterLevel || "Genangan Air",
                  disasterCategory: r.category || "Banjir / Rob Pesisir",
                  severity: (r.severity === "HIGH" || r.severity === "CRITICAL" ? "TINGGI" : "SEDANG") as any,
                  status: mappedStatus,
                  vulnerableCount: { elderly: 0, children: 0, sick: 0 },
                  aiConfidence: conf,
                  aiClassification: isAuto ? `Banjir Terverifikasi Sistem (${conf}%)` : `Menunggu Verifikasi Petugas (${conf}%)`,
                  description: r.notes || r.title || "Laporan genangan air dari warga siaga.",
                  photoUrl: (r.photos && r.photos[0]) || "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
                  photos: r.photos || [],
                  lat: r.gps?.lat,
                  lng: r.gps?.lng,
                };
              });
          }
        }
      } catch {}

      setReports(localReports);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();

    const handleUpdate = () => {
      loadReports();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("dermayu_reports_updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    // Polling berkala setiap 5 detik agar selalu up-to-date antar jendela browser
    const timer = setInterval(loadReports, 5000);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("dermayu_reports_updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
      clearInterval(timer);
    };
  }, [loadReports]);

  // Update status di LocalStorage
  const syncLocalReportStatus = (ticketCode: string, newStatus: string, reason?: string) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((item: any) => {
            if (item.id === ticketCode) {
              const citizenStatus =
                newStatus === "ARMADA_DIKERAHKAN"
                  ? "PENANGANAN"
                  : newStatus === "SELESAI"
                  ? "SELESAI"
                  : newStatus === "DITOLAK"
                  ? "DITOLAK"
                  : "DIVERIFIKASI";
              return {
                ...item,
                status: citizenStatus,
                statusNote:
                  newStatus === "ARMADA_DIKERAHKAN"
                    ? "Regu SAR LCR BPBD Indramayu telah dikerahkan ke lokasi aduan Anda."
                    : newStatus === "SELESAI"
                    ? "Penanganan genangan air telah diselesaikan oleh tim lapangan."
                    : newStatus === "DITOLAK"
                    ? (reason || "Laporan ditolak oleh petugas posko.")
                    : item.statusNote,
              };
            }
            return item;
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("dermayu_reports_updated", { detail: updated }));
        }
      }
    } catch (err) {
      console.warn("Gagal update local report:", err);
    }
  };

  // Status Filter Counts
  const countSubmitted = reports.filter((r) => r.status === "SUBMITTED" || r.status === "VERIFIED").length;
  const countDispatched = reports.filter((r) => r.status === "ARMADA_DIKERAHKAN").length;
  const countResolved = reports.filter((r) => r.status === "SELESAI").length;
  const countRejected = reports.filter((r) => r.status === "DITOLAK").length;

  const filteredReports = reports.filter((r) => {
    const matchStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "PENDING" && (r.status === "SUBMITTED" || r.status === "VERIFIED")) ||
      (selectedStatus === "DISPATCHED" && r.status === "ARMADA_DIKERAHKAN") ||
      (selectedStatus === "RESOLVED" && r.status === "SELESAI") ||
      (selectedStatus === "REJECTED" && r.status === "DITOLAK");

    const matchQuery =
      r.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchQuery;
  });

  const handleVerifyAndDispatch = async (rep: CivicReport) => {
    const unitName = "Regu SAR LCR-02 BPBD Indramayu";
    setReports((prev) =>
      prev.map((item) =>
        item.id === rep.id
          ? {
              ...item,
              status: "ARMADA_DIKERAHKAN",
              assignedUnit: unitName,
            }
          : item
      )
    );
    if (selectedReport?.id === rep.id) {
      setSelectedReport({
        ...rep,
        status: "ARMADA_DIKERAHKAN",
        assignedUnit: unitName,
      });
    }

    // Sync ke Server API
    try {
      await fetch(`/api/laporan/${rep.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ARMADA_DIKERAHKAN",
          assignedUnit: unitName,
        }),
      });
    } catch {}

    // Sync ke LocalStorage
    syncLocalReportStatus(rep.ticketCode, "ARMADA_DIKERAHKAN");

    setNotification(
      rep.status === "VERIFIED" || rep.aiConfidence > 60
        ? `Armada SAR dikerahkan ke lokasi #${rep.ticketCode}!`
        : `Tiket #${rep.ticketCode} diverifikasi manual & Armada SAR dikerahkan!`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResolve = async (rep: CivicReport) => {
    setReports((prev) =>
      prev.map((item) =>
        item.id === rep.id ? { ...item, status: "SELESAI" } : item
      )
    );
    if (selectedReport?.id === rep.id) {
      setSelectedReport({ ...rep, status: "SELESAI" });
    }

    // Sync ke Server API
    try {
      await fetch(`/api/laporan/${rep.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SELESAI" }),
      });
    } catch {}

    // Sync ke LocalStorage
    syncLocalReportStatus(rep.ticketCode, "SELESAI");

    setNotification(`Tiket #${rep.ticketCode} berhasil diselesaikan.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReject = async (rep: CivicReport) => {
    const reason = prompt(
      `Masukkan alasan penolakan tiket #${rep.ticketCode}:`,
      "Foto tidak relevan / Laporan uji coba"
    );
    if (!reason || !reason.trim()) return;

    setReports((prev) =>
      prev.map((item) =>
        item.id === rep.id
          ? { ...item, status: "DITOLAK", rejectionReason: reason.trim() }
          : item
      )
    );
    if (selectedReport?.id === rep.id) {
      setSelectedReport({ ...rep, status: "DITOLAK", rejectionReason: reason.trim() });
    }

    // Sync ke Server API
    try {
      await fetch(`/api/laporan/${rep.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DITOLAK", rejectionReason: reason.trim() }),
      });
    } catch {}

    // Sync ke LocalStorage
    syncLocalReportStatus(rep.ticketCode, "DITOLAK", reason.trim());

    setNotification(`Tiket #${rep.ticketCode} ditolak: ${reason.trim()}`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner Alert Sukses */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold text-emerald-700 underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* METRIK RINGKAS TRIAGE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#D5E4E0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Perlu Tindakan SAR</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{countSubmitted}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D5E4E0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Diproses SAR</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{countDispatched}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <Ship className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D5E4E0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Selesai Ditangani</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{countResolved}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D5E4E0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Ditolak / Duplikat</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{countRejected}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CONTROLS: TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Semua", count: reports.length },
            { id: "PENDING", label: "Perlu Tindakan SAR", count: countSubmitted },
            { id: "DISPATCHED", label: "SAR Aktif", count: countDispatched },
            { id: "RESOLVED", label: "Selesai", count: countResolved },
            { id: "REJECTED", label: "Ditolak", count: countRejected },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStatus === tab.id
                  ? "bg-[#38746D] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-[#D5E4E0] hover:bg-slate-50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  selectedStatus === tab.id
                    ? "bg-white/20 text-white font-medium"
                    : "bg-slate-100 text-slate-600 font-medium"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadReports()}
            className="p-2 rounded-xl bg-white border border-[#D5E4E0] text-slate-600 hover:text-[#38746D] hover:bg-slate-50 transition-colors"
            title="Segarkan data laporan"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#38746D]" : ""}`} />
          </button>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode tiket, nama pelapor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* TABEL DAFTAR ADUAN */}
      <div className="bg-white rounded-3xl border border-[#D5E4E0] shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Tidak Ada Antrean Aduan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ditemukan laporan dengan kata kunci "${searchQuery}".`
                : "Saat ini antrean laporan darurat warga bersih. Seluruh aduan telah diverifikasi atau belum ada laporan baru."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#EEF5F3] text-[#24544E] font-semibold uppercase tracking-wider text-[11px] border-b border-[#D5E4E0]">
                <tr>
                  <th className="px-4 py-3">Tiket &amp; Waktu</th>
                  <th className="px-4 py-3">Pelapor &amp; Lokasi</th>
                  <th className="px-4 py-3">Ketinggian &amp; Kategori</th>
                  <th className="px-4 py-3">Validasi Citra</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((rep) => (
                  <tr
                    key={rep.id}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedReport(rep)}
                  >
                    {/* Tiket */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        #{rep.ticketCode}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        {rep.timeReceived}
                      </div>
                    </td>

                    {/* Pelapor & Lokasi */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 text-xs">{rep.reporterName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]" title={rep.location}>
                          {rep.location}
                        </span>
                      </div>
                    </td>

                    {/* Ketinggian & Kategori */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-xs">
                        {rep.waterLevel.replace(/\s*\(.*?\)/g, "").trim()}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {rep.disasterCategory}
                      </span>
                    </td>

                    {/* Validasi Citra */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck
                          className={`w-4 h-4 ${
                            rep.aiConfidence >= 60
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        />
                        <span
                          className={`font-bold text-xs ${
                            rep.aiConfidence >= 60
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          {rep.aiConfidence}% Valid
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {rep.status === "VERIFIED" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Terverifikasi Sistem
                        </span>
                      )}
                      {rep.status === "SUBMITTED" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Menunggu Verifikasi
                        </span>
                      )}
                      {rep.status === "ARMADA_DIKERAHKAN" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-300 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          SAR Dikerahkan
                        </span>
                      )}
                      {rep.status === "SELESAI" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          Selesai
                        </span>
                      )}
                      {rep.status === "DITOLAK" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-300 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Ditolak
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {rep.status === "VERIFIED" && (
                          <button
                            type="button"
                            onClick={() => handleVerifyAndDispatch(rep)}
                            className="px-2.5 py-1 rounded-lg bg-[#38746D] hover:bg-[#25504B] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Kirim Regu SAR Lapangan (Titik telah otomatis aktif di peta)"
                          >
                            <Ship className="w-3.5 h-3.5" />
                            <span>Kerahkan SAR</span>
                          </button>
                        )}

                        {rep.status === "SUBMITTED" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerifyAndDispatch(rep)}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Verifikasi Manual Petugas & Kirim Regu SAR"
                            >
                              <Ship className="w-3.5 h-3.5" />
                              <span>Verifikasi SAR</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(rep)}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
                              title="Tolak Aduan"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {rep.status === "ARMADA_DIKERAHKAN" && (
                          <button
                            type="button"
                            onClick={() => handleResolve(rep)}
                            className="px-2.5 py-1 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selesai</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedReport(rep)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Lihat Detail Aduan"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL ADUAN */}
      {selectedReport && (() => {
        const hasVulnerable =
          (selectedReport.vulnerableCount?.elderly || 0) +
          (selectedReport.vulnerableCount?.children || 0) +
          (selectedReport.vulnerableCount?.sick || 0) > 0;

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
              {/* Header Modal */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-slate-900">
                      #{selectedReport.ticketCode}
                    </span>
                    {selectedReport.status === "VERIFIED" ? (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        Terverifikasi Sistem
                      </span>
                    ) : selectedReport.status === "ARMADA_DIKERAHKAN" ? (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-200">
                        Armada SAR Dikerahkan
                      </span>
                    ) : selectedReport.status === "SELESAI" ? (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        Selesai
                      </span>
                    ) : (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
                        Perlu Review Petugas
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Waktu Lapor: {selectedReport.timeReceived}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-4 sm:p-5 space-y-4">
                {/* Bukti Foto Laporan */}
                {selectedReport.photoUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-64 flex items-center justify-center shadow-inner">
                    <img
                      src={selectedReport.photoUrl}
                      alt="Foto Bukti Genangan"
                      className="w-full h-full max-h-64 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="truncate max-w-xs">{selectedReport.location}</span>
                    </div>
                  </div>
                )}

                {/* Status Validasi Bar */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800">
                      Validasi Citra: <span className="text-emerald-700">{selectedReport.aiConfidence}% Valid</span>
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-600 font-medium">
                      {selectedReport.status === "VERIFIED" || selectedReport.aiConfidence > 60
                        ? "Terpetakan Aktif di Peta Warga"
                        : "Menunggu Konfirmasi Manual"}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-700 text-[11px] self-start sm:self-auto bg-white px-2 py-0.5 rounded border border-slate-200">
                    Kategori: {selectedReport.disasterCategory}
                  </span>
                </div>

                {/* Catatan Pelapor */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Catatan Pelapor
                  </span>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                    "{selectedReport.description}"
                  </div>
                </div>

                {/* Data Lapangan Grid 2 Kolom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lokasi Kejadian</span>
                      <span className="text-[11px] font-bold text-[#38746D]">{selectedReport.waterLevel}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{selectedReport.location}</p>
                    <p className="text-[11px] text-slate-500">Kecamatan {selectedReport.district}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kelompok Rentan</span>
                    {hasVulnerable ? (
                      <>
                        <p className="text-xs font-bold text-rose-700">
                          {selectedReport.vulnerableCount.elderly > 0 && `${selectedReport.vulnerableCount.elderly} Lansia `}
                          {selectedReport.vulnerableCount.children > 0 && `${selectedReport.vulnerableCount.children} Anak `}
                          {selectedReport.vulnerableCount.sick > 0 && `${selectedReport.vulnerableCount.sick} Sakit`}
                        </p>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                          Prioritas Evakuasi Tinggi
                        </span>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-slate-700">Nihil / Warga Mandiri</p>
                        <p className="text-[11px] text-slate-500">Tidak ada korban sakit atau lansia terjebak</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Kontak Pelapor */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">{selectedReport.reporterName}</span>
                      <span className="text-xs text-slate-500 ml-1.5">({selectedReport.reporterPhone})</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${selectedReport.reporterPhone.replace(/[^0-9]/g, "")}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Hubungi
                  </a>
                </div>

                {/* Alasan Penolakan (Jika ada) */}
                {selectedReport.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                    <span className="font-bold">Alasan Penolakan: </span>
                    {selectedReport.rejectionReason}
                  </div>
                )}
              </div>

              {/* Footer Modal Actions */}
              <div className="p-4 sm:p-5 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Tutup
                </button>

                {/* Jika laporan SUDAH diverifikasi AI (>60%): Langsung tombol Kerahkan SAR (tidak ada Tolak) */}
                {selectedReport.status === "VERIFIED" && (
                  <button
                    type="button"
                    onClick={() => handleVerifyAndDispatch(selectedReport)}
                    className="px-4 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Luncurkan Armada SAR ke Lokasi (Titik Sudah Aktif di Peta)"
                  >
                    <Ship className="w-4 h-4" />
                    <span>Kerahkan Armada SAR</span>
                  </button>
                )}

                {/* Jika laporan BELUM diverifikasi (0-60%): Petugas bisa Verifikasi Manual atau Tolak Aduan */}
                {selectedReport.status === "SUBMITTED" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedReport)}
                      className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Tolak Aduan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyAndDispatch(selectedReport)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      title="Verifikasi Manual & Luncurkan Armada SAR"
                    >
                      <Ship className="w-4 h-4" />
                      <span>Verifikasi Manual &amp; Kerahkan SAR</span>
                    </button>
                  </>
                )}

                {selectedReport.status === "ARMADA_DIKERAHKAN" && (
                  <button
                    type="button"
                    onClick={() => handleResolve(selectedReport)}
                    className="px-4 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tandai Telah Selesai</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
