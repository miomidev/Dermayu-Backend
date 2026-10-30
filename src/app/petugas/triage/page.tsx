"use client";

import { useState } from "react";
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
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  AlertTriangle,
  X,
  FileText,
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
  rejectionReason?: string;
  assignedUnit?: string;
}

const initialReports: CivicReport[] = [
  {
    id: "rep-01",
    ticketCode: "DMY-2026-0089",
    timeReceived: "10 menit yang lalu",
    reporterName: "Pak Kusnan",
    reporterPhone: "0812-3456-7890",
    location: "RT 04 / RW 02, Desa Eretan Wetan",
    district: "Kandanghaur",
    waterLevel: "50-80 cm (Setinggi Paha)",
    disasterCategory: "Rob Pesisir",
    severity: "TINGGI",
    status: "SUBMITTED",
    vulnerableCount: { elderly: 2, children: 1, sick: 0 },
    aiConfidence: 94.8,
    aiClassification: "Rob Pesisir - Pasang Air Laut Keruh",
    description: "Air laut pasang cepat sejak pukul 12.30 WIB, masuk ruang tamu setinggi 60cm. Ada 2 lansia kesulitan jalan butuh dievakuasi ke balai desa.",
    photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rep-02",
    ticketCode: "DMY-2026-0088",
    timeReceived: "25 menit yang lalu",
    reporterName: "Ibu Maryati",
    reporterPhone: "0878-1122-3344",
    location: "Blok Karanganyar, Desa Cantigi Kulon",
    district: "Cantigi",
    waterLevel: "80-120 cm (Setinggi Dada)",
    disasterCategory: "Rob Pesisir",
    severity: "TINGGI",
    status: "SUBMITTED",
    vulnerableCount: { elderly: 1, children: 3, sick: 1 },
    aiConfidence: 96.2,
    aiClassification: "Genangan Pasang Tinggi Arus Lambat",
    description: "Tanggul tambak jebol akibat rob pasang sore. 4 rumah terisolasi, listrik sudah dipadamkan PLN setempat.",
    photoUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rep-03",
    ticketCode: "DMY-2026-0087",
    timeReceived: "42 menit yang lalu",
    reporterName: "H. Sukirno",
    reporterPhone: "0852-9988-7766",
    location: "Bantaran Kali Cimanuk, Desa Sukagumiwang",
    district: "Sukagumiwang",
    waterLevel: "30-50 cm (Setinggi Lutut)",
    disasterCategory: "Luapan Cimanuk",
    severity: "SEDANG",
    status: "SUBMITTED",
    vulnerableCount: { elderly: 0, children: 0, sick: 0 },
    aiConfidence: 91.5,
    aiClassification: "Luapan Sedimentasi Aliran Sungai",
    description: "Air buangan saluran irigasi meluber ke jalan poros desa. Kendaraan roda 2 mogok jika memaksa lewat.",
    photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rep-04",
    ticketCode: "DMY-2026-0085",
    timeReceived: "1 jam yang lalu",
    reporterName: "Bpk. Wawan",
    reporterPhone: "0813-4455-6677",
    location: "Dusun Cidempet, Blok Dermaga",
    district: "Arahan",
    waterLevel: "60-90 cm (Setinggi Paha)",
    disasterCategory: "Rob Pesisir",
    severity: "TINGGI",
    status: "ARMADA_DIKERAHKAN",
    vulnerableCount: { elderly: 1, children: 2, sick: 0 },
    aiConfidence: 97.4,
    aiClassification: "Banjir Rob Pantura",
    description: "Tim SAR Regu Alpha Posko Eretan telah meluncur dengan 1 perahu LCR dan 4 personel.",
    photoUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80",
    assignedUnit: "Regu SAR Alpha (Perahu LCR-02)",
  },
  {
    id: "rep-05",
    ticketCode: "DMY-2026-0082",
    timeReceived: "3 jam yang lalu",
    reporterName: "Ibu Rohanah",
    reporterPhone: "0821-6677-8899",
    location: "Jl. Lapangan Bola Desa Puntang",
    district: "Losarang",
    waterLevel: "15-30 cm (Setinggi Mata Kaki)",
    disasterCategory: "Genangan Drainase",
    severity: "RENDAH",
    status: "SELESAI",
    vulnerableCount: { elderly: 0, children: 0, sick: 0 },
    aiConfidence: 88.0,
    aiClassification: "Genangan Genangan Surut Hujan Lokal",
    description: "Air telah surut setelah pompa submersible portabel BPBD diaktifkan.",
    photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rep-06",
    ticketCode: "DMY-2026-0080",
    timeReceived: "4 jam yang lalu",
    reporterName: "Ahmad Z.",
    reporterPhone: "0896-1234-5678",
    location: "Perum Graha Indramayu",
    district: "Indramayu Kota",
    waterLevel: "< 10 cm",
    disasterCategory: "Genangan Drainase",
    severity: "RENDAH",
    status: "DITOLAK",
    vulnerableCount: { elderly: 0, children: 0, sick: 0 },
    aiConfidence: 45.2,
    aiClassification: "Bukan Banjir Signifikan",
    description: "Laporan foto hanya berupa genangan cucian piring di halaman rumah. Bukan bencana banjir rob/luapan sungai.",
    rejectionReason: "Foto dan data tidak relevan dengan kriteria darurat bencana banjir (PRD Sec 5.3)",
    photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
  },
];

export default function PetugasTriagePage() {
  const [reports, setReports] = useState<CivicReport[]>(initialReports);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Status Filter Counts
  const countSubmitted = reports.filter((r) => r.status === "SUBMITTED").length;
  const countDispatched = reports.filter((r) => r.status === "ARMADA_DIKERAHKAN").length;
  const countResolved = reports.filter((r) => r.status === "SELESAI").length;
  const countRejected = reports.filter((r) => r.status === "DITOLAK").length;

  const filteredReports = reports.filter((r) => {
    const matchStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "PENDING" && r.status === "SUBMITTED") ||
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

  const handleVerifyAndDispatch = (rep: CivicReport) => {
    setReports((prev) =>
      prev.map((item) =>
        item.id === rep.id
          ? {
              ...item,
              status: "ARMADA_DIKERAHKAN",
              assignedUnit: "Regu SAR Terdekat (Dispatched via Pusdalops)",
            }
          : item
      )
    );
    if (selectedReport?.id === rep.id) {
      setSelectedReport({
        ...rep,
        status: "ARMADA_DIKERAHKAN",
        assignedUnit: "Regu SAR Terdekat (Dispatched via Pusdalops)",
      });
    }
    setNotification(`Tiket #${rep.ticketCode} diverifikasi! Armada SAR dikerahkan ke lokasi.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResolve = (rep: CivicReport) => {
    setReports((prev) =>
      prev.map((item) =>
        item.id === rep.id ? { ...item, status: "SELESAI" } : item
      )
    );
    if (selectedReport?.id === rep.id) {
      setSelectedReport({ ...rep, status: "SELESAI" });
    }
    setNotification(`Tiket #${rep.ticketCode} berhasil diselesaikan.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReject = (rep: CivicReport) => {
    const reason = prompt(
      `Masukkan alasan penolakan tiket #${rep.ticketCode} (Wajib sesuai spesifikasi PRD):`,
      "Foto tidak relevan / Laporan duplikat"
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
    setNotification(`Tiket #${rep.ticketCode} ditolak: ${reason.trim()}`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
        {/* Banner Alert Sukses */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs font-bold text-emerald-700 underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* METRIK RINGKAS TRIAGE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#D5E4E0] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">Menunggu Verifikasi</p>
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
              { id: "PENDING", label: "Perlu Verifikasi", count: countSubmitted },
              { id: "DISPATCHED", label: "SAR Aktif", count: countDispatched },
              { id: "RESOLVED", label: "Selesai", count: countResolved },
              { id: "REJECTED", label: "Ditolak", count: countRejected },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === tab.id
                    ? "bg-[#1D443F] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-[#D5E4E0] hover:bg-gray-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedStatus === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode tiket, nama pelapor, desa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] transition-colors"
            />
          </div>
        </div>

        {/* TABEL DAFTAR ADUAN */}
        <div className="bg-white rounded-3xl border border-[#D5E4E0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#EEF5F3] text-[#1D443F] font-bold uppercase tracking-wider text-[11px] border-b border-[#D5E4E0]">
                <tr>
                  <th className="px-5 py-3.5">Tiket & Waktu</th>
                  <th className="px-5 py-3.5">Pelapor & Lokasi</th>
                  <th className="px-5 py-3.5">Ketinggian & Kategori</th>
                  <th className="px-5 py-3.5">AI CNN Verifikasi</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Tindakan Cepat</th>
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
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-[#1D443F]">{rep.ticketCode}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {rep.timeReceived}
                      </div>
                    </td>

                    {/* Pelapor & Lokasi */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{rep.reporterName}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {rep.location}, {rep.district}
                        </span>
                      </div>
                    </td>

                    {/* Ketinggian & Kategori */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{rep.waterLevel}</div>
                      <div className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#1D443F] border border-teal-200">
                        {rep.disasterCategory}
                      </div>
                    </td>

                    {/* AI CNN */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span className="font-bold text-teal-700">{rep.aiConfidence}%</span>
                      </div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[140px]">
                        {rep.aiClassification}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      {rep.status === "SUBMITTED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                          Menunggu Triage
                        </span>
                      )}
                      {rep.status === "ARMADA_DIKERAHKAN" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                          SAR Bergerak
                        </span>
                      )}
                      {rep.status === "SELESAI" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Selesai
                        </span>
                      )}
                      {rep.status === "DITOLAK" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                          Ditolak
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {rep.status === "SUBMITTED" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerifyAndDispatch(rep)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#1D443F] hover:bg-[#38746D] text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1"
                              title="Verifikasi & Luncurkan SAR"
                            >
                              <Ship className="w-3.5 h-3.5" />
                              Kirim SAR
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(rep)}
                              className="px-2 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-[11px] font-bold transition-all"
                              title="Tolak Aduan"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {rep.status === "ARMADA_DIKERAHKAN" && (
                          <button
                            type="button"
                            onClick={() => handleResolve(rep)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Selesaikan
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedReport(rep)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
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
        </div>

        {/* MODAL DETAIL ADUAN */}
        {selectedReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              {/* Header Modal */}
              <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#1D443F] text-base">
                      Detail Aduan #{selectedReport.ticketCode}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 font-bold text-gray-700">
                      {selectedReport.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Diterima: {selectedReport.timeReceived}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* AI Detection Banner */}
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#38746D] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-[#1D443F] flex items-center gap-2">
                      <span>Klasifikasi AI Vision CNN: {selectedReport.aiClassification}</span>
                      <span className="px-2 py-0.2 rounded-full bg-white text-teal-800 font-extrabold text-[10px]">
                        {selectedReport.aiConfidence}% Akurasi
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Model memverifikasi visual air rob dengan ketinggian terestimasi {selectedReport.waterLevel}.
                    </p>
                  </div>
                </div>

                {/* Deskripsi & Foto */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase">Keterangan Pelapor</h4>
                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-2xl border border-gray-200 leading-relaxed">
                    "{selectedReport.description}"
                  </p>
                </div>

                {/* Info Korban Rentan & Lokasi */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border border-gray-200 space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Lokasi Kejadian</span>
                    <p className="text-xs font-bold text-gray-900">{selectedReport.location}</p>
                    <p className="text-[11px] text-gray-500">Kecamatan {selectedReport.district}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-gray-200 space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Kelompok Rentan</span>
                    <p className="text-xs font-bold text-gray-900">
                      {selectedReport.vulnerableCount.elderly} Lansia • {selectedReport.vulnerableCount.children} Anak-anak • {selectedReport.vulnerableCount.sick} Sakit
                    </p>
                    <p className="text-[11px] text-amber-700 font-semibold">Prioritas Evakuasi Tinggi</p>
                  </div>
                </div>

                {/* Info Kontak Pelapor */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-[#38746D]" />
                    <span className="text-xs font-bold text-gray-900">{selectedReport.reporterName}</span>
                    <span className="text-xs text-gray-500">({selectedReport.reporterPhone})</span>
                  </div>
                  <a
                    href={`tel:${selectedReport.reporterPhone.replace(/[^0-9]/g, "")}`}
                    className="px-3 py-1.5 rounded-xl bg-[#1D443F] text-white text-xs font-bold hover:bg-[#38746D] transition-colors"
                  >
                    Hubungi Pelapor
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
              <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Tutup
                </button>

                {selectedReport.status === "SUBMITTED" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedReport)}
                      className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold"
                    >
                      Tolak Aduan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyAndDispatch(selectedReport)}
                      className="px-4 py-2 rounded-xl bg-[#1D443F] hover:bg-[#38746D] text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Ship className="w-4 h-4" />
                      Verifikasi & Kerahkan SAR
                    </button>
                  </>
                )}

                {selectedReport.status === "ARMADA_DIKERAHKAN" && (
                  <button
                    type="button"
                    onClick={() => handleResolve(selectedReport)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tandai Telah Selesai
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

