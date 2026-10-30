"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  PlusCircle,
  MapPin,
  Sparkles,
  Ban,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter,
} from "lucide-react";

type ReportStatusCode =
  | "SUBMITTED"
  | "VERIFIED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELLED";

interface ComplaintItem {
  id: string;
  ticketCode: string;
  category: string;
  title: string;
  location: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  waterLevelText: string;
  status: ReportStatusCode;
  createdAt: string;
  note: string;
  aiConfidence?: number;
}

export default function WargaAduanPage() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [complaints, setComplaints] = useState<ComplaintItem[]>([
    {
      id: "1",
      ticketCode: "DMY-20261030-0089",
      category: "Banjir / Genangan Rob",
      title: "Luapan Rob Pantai Rendam Jalan Pemukiman RT 04",
      location: "Blok Karanganyar, Eretan Wetan",
      severity: "CRITICAL",
      waterLevelText: "Setinggi Lutut (60 cm)",
      status: "ASSIGNED",
      createdAt: "15 Menit yang lalu",
      note: "Regu SAR Pos Eretan bersama 1 perahu karet LCR sedang bergerak evakuasi 3 lansia.",
      aiConfidence: 0.94,
    },
    {
      id: "2",
      ticketCode: "DMY-20261030-0042",
      category: "Tanggul Kritis",
      title: "Rembesan Tanggul Saluran Sekunder Kali Cimanuk",
      location: "Jl. Muara Lama No. 12, Kandanghaur",
      severity: "MEDIUM",
      waterLevelText: "Semata Kaki (35 cm)",
      status: "VERIFIED",
      createdAt: "3 Jam yang lalu",
      note: "Laporan tervalidasi via sensor telemetri. Masuk antrean logistik karung pasir pengaman.",
    },
    {
      id: "3",
      ticketCode: "DMY-20261028-0112",
      category: "Drainase Mampet",
      title: "Gorong-gorong Jembatan Desa Tersumbat Sampah Eceng Gondok",
      location: "Blok Karang Baru RT 01, Losarang",
      severity: "LOW",
      waterLevelText: "20 cm",
      status: "RESOLVED",
      createdAt: "2 Hari yang lalu",
      note: "Tim Satgas Dinas PUPR Indramayu telah membersihkan material sampah.",
    },
  ]);

  const handleCancel = (id: string, ticketCode: string) => {
    if (confirm(`Apakah Anda yakin ingin membatalkan laporan #${ticketCode}?`)) {
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: "CANCELLED", note: "Laporan dibatalkan secara mandiri oleh pelapor." }
            : c
        )
      );
    }
  };

  const filtered = complaints.filter((c) => {
    if (filterStatus === "ALL") return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6 text-left">
        {/* Header Bar & Quick CTA */}
        <section className="bg-white rounded-3xl border border-[#D5E4E0] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#132422] flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#38746D]" />
              Pelacakan Status Aduan &amp; Tiket Darurat
            </h2>
            <p className="text-xs text-[#4B635F] mt-0.5">
              Pantau progres tindak lanjut tim reaksi cepat BPBD Indramayu secara transparan (PRD FR-RPT-07)
            </p>
          </div>

          <Link
            href="/warga/lapor"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Kirim Aduan Baru</span>
          </Link>
        </section>

        {/* Filter Tab Status */}
        <div className="flex flex-wrap gap-2">
          {[
            { code: "ALL", label: "Semua Tiket" },
            { code: "SUBMITTED", label: "Diterima" },
            { code: "VERIFIED", label: "Terverifikasi" },
            { code: "ASSIGNED", label: "Petugas Ditugaskan" },
            { code: "RESOLVED", label: "Selesai" },
            { code: "CANCELLED", label: "Dibatalkan" },
          ].map((st) => (
            <button
              type="button"
              key={st.code}
              onClick={() => setFilterStatus(st.code)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st.code
                  ? "bg-[#38746D] text-white shadow-xs"
                  : "bg-white text-[#4B635F] border border-[#D5E4E0] hover:bg-gray-50"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* List Aduan */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-[#D5E4E0] text-center space-y-2">
              <p className="text-sm font-bold text-gray-500">Tidak ada tiket laporan pada status ini.</p>
              <Link href="/warga/lapor" className="text-xs font-bold text-[#38746D] hover:underline">
                Kirim Laporan Baru
              </Link>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] hover:border-[#38746D] transition-all shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-[#F8FAF9] border border-[#D5E4E0] px-2.5 py-1 rounded-lg text-[#132422]">
                      #{item.ticketCode}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EEF5F3] text-[#38746D]">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.severity === "CRITICAL"
                          ? "bg-rose-100 text-rose-800"
                          : item.severity === "HIGH"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      Prioritas: {item.severity}
                    </span>
                  </div>

                  {/* Status Badge PRD */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                      item.status === "SUBMITTED"
                        ? "bg-slate-100 text-slate-800 border-slate-300"
                        : item.status === "VERIFIED"
                        ? "bg-blue-100 text-blue-900 border-blue-300"
                        : item.status === "ASSIGNED"
                        ? "bg-purple-100 text-purple-900 border-purple-300"
                        : item.status === "IN_PROGRESS"
                        ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                        : item.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : item.status === "REJECTED"
                        ? "bg-rose-100 text-rose-900 border-rose-300"
                        : "bg-gray-100 text-gray-500 border-gray-300"
                    }`}
                  >
                    {item.status === "SUBMITTED" && "Diterima Pusdalops"}
                    {item.status === "VERIFIED" && "Terverifikasi BPBD"}
                    {item.status === "ASSIGNED" && "Petugas Ditugaskan"}
                    {item.status === "IN_PROGRESS" && "Sedang Ditangani"}
                    {item.status === "RESOLVED" && "Selesai Ditangani"}
                    {item.status === "REJECTED" && "Laporan Ditolak"}
                    {item.status === "CANCELLED" && "Dibatalkan Pelapor"}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#132422]">{item.title}</h3>
                  <p className="text-xs text-[#718783] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#38746D]" />
                    <span>{item.location} &bull; <strong>Air: {item.waterLevelText}</strong></span>
                  </p>
                </div>

                {/* AI Validation Indicator */}
                {item.aiConfidence && (
                  <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Validasi AI CNN: <strong>Terindikasi Banjir ({Math.round(item.aiConfidence * 100)}% Confidence)</strong></span>
                  </div>
                )}

                {/* Catatan Tindak Lanjut Petugas */}
                <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] text-xs text-[#4B635F]">
                  <p className="font-bold text-[#132422] mb-0.5">Tindak Lanjut Pusdalops PB:</p>
                  <p>{item.note}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#718783]">
                  <span>Waktu Kirim: {item.createdAt}</span>

                  {/* PRD FR-RPT-08: Pembatalan Laporan jika status masih SUBMITTED */}
                  {item.status === "SUBMITTED" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(item.id, item.ticketCode)}
                      className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Batalkan Laporan</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  );
}

