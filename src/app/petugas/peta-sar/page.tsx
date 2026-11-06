"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  ShieldCheck,
  Navigation,
  PlusCircle,
  CheckCircle2,
  PhoneCall,
  X,
  RefreshCw,
  Camera,
  Droplets,
  Waves,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { getActiveSession } from "@/utils/authSession";
import { CURATED_POSKO_LIST, FLOOD_OBSTACLES } from "@/data/curatedEvakuasiData";
import { getAllPosko } from "@/utils/poskoService";
import type {
  MapReportPoint,
  MapShelterPoint,
  MapTelemetryPoint,
} from "@/components/dashboard/PetugasSpatialMap";

// Dynamic import for Leaflet Spatial Map (SSR Disabled)
const PetugasSpatialMap = dynamic(
  () => import("@/components/dashboard/PetugasSpatialMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-3xl bg-[#EEF5F3] border border-[#D5E4E0] flex flex-col items-center justify-center text-[#4B635F] space-y-2">
        <RefreshCw className="w-7 h-7 animate-spin text-[#38746D]" />
        <span className="text-xs font-semibold">Memuat Peta Spasial & SAR Pusdalops...</span>
      </div>
    ),
  }
);

interface UserSession {
  name: string;
  email: string;
  role: string;
  district: string;
}

type ReportCategoryCode = "FLOOD" | "LEVEE" | "DRAINAGE" | "ROAD" | "TREE" | "OTHER";
type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type WaterLevelCode = "ANKLE" | "KNEE" | "THIGH" | "WAIST" | "ABOVE_CHEST";
type ReportStatusCode =
  | "SUBMITTED"
  | "VERIFIED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELLED";

interface ComplaintTicket {
  id: string;
  ticketCode: string;
  category: ReportCategoryCode;
  categoryLabel: string;
  title: string;
  location: string;
  severity: SeverityLevel;
  waterLevel?: WaterLevelCode;
  waterLevelText?: string;
  status: ReportStatusCode;
  createdAt: string;
  note: string;
  photos: string[];
  urgentNeeds: string[];
  aiScore?: {
    label: string;
    confidence: number;
  };
  lat?: number;
  lng?: number;
}

interface EmergencyContactItem {
  id: string;
  name: string;
  agency: string;
  phone: string;
  description: string;
  badge: string;
}

export default function PetugasPetaSarPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [, setSession] = useState<UserSession>({
    name: "Petugas BPBD Indramayu",
    email: "petugas@dermayu.id",
    role: "petugas",
    district: "Pusdalops PB Indramayu",
  });

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  // Report form state
  const [reportCategory, setReportCategory] = useState<ReportCategoryCode>("FLOOD");
  const [reportTitle, setReportTitle] = useState("");
  const [reportLocation, setReportLocation] = useState("");
  const [reportSeverity, setReportSeverity] = useState<SeverityLevel>("HIGH");
  const [reportWaterLevel, setReportWaterLevel] = useState<WaterLevelCode>("KNEE");
  const [reportUrgentNeeds, setReportUrgentNeeds] = useState<string[]>([]);
  const [reportNotes, setReportNotes] = useState("");
  const [reportPhotos, setReportPhotos] = useState<string[]>([]);
  const [reportSubmittedSuccess, setReportSubmittedSuccess] = useState(false);

  // Complaints / Reports
  const STORAGE_KEY = "dermayu_user_reports";

  const [complaints, setComplaints] = useState<ComplaintTicket[]>([
    {
      id: "1",
      ticketCode: "DMY-20261030-0089",
      category: "FLOOD",
      categoryLabel: "Banjir / Rob",
      title: "Luapan Rob Pantai Rendam Jalan Pemukiman RT 04",
      location: "Blok Karanganyar, Eretan Wetan",
      severity: "CRITICAL",
      waterLevel: "KNEE",
      waterLevelText: "Setinggi Lutut (60 cm)",
      status: "ASSIGNED",
      createdAt: "15 Menit yang lalu",
      note: "Regu SAR Pos Eretan bersama perahu LCR sedang evakuasi warga kelompok rentan.",
      photos: ["/login-art.png"],
      urgentNeeds: ["Perahu Evakuasi", "Bantuan Medis Lansia"],
      aiScore: {
        label: "flood",
        confidence: 0.94,
      },
      lat: -6.3475,
      lng: 108.1189,
    },
    {
      id: "2",
      ticketCode: "DMY-20261030-0042",
      category: "LEVEE",
      categoryLabel: "Tanggul Kritis",
      title: "Rembesan Tanggul Saluran Sekunder Kali Cimanuk",
      location: "Jl. Muara Lama No. 12, Kandanghaur",
      severity: "MEDIUM",
      waterLevel: "ANKLE",
      waterLevelText: "Semata Kaki (35 cm)",
      status: "VERIFIED",
      createdAt: "3 Jam yang lalu",
      note: "Laporan terverifikasi. Masuk antrean penanganan karung pasir pengaman.",
      photos: [],
      urgentNeeds: ["Karung Pasir"],
      lat: -6.355,
      lng: 108.135,
    },
  ]);

  // Sinkronisasi data laporan dari LocalStorage secara real-time
  const syncReportsFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const loadedTickets: ComplaintTicket[] = parsed.map((t: any, idx: number) => {
            const catCode = (t.categoryCode || "FLOOD") as ReportCategoryCode;
            const sevLevel = (t.severity || (t.status === "PENANGANAN" ? "CRITICAL" : "HIGH")) as SeverityLevel;
            const statusMapped: ReportStatusCode =
              t.status === "PENANGANAN"
                ? "ASSIGNED"
                : t.status === "DIVERIFIKASI"
                ? "VERIFIED"
                : "SUBMITTED";

            return {
              id: t.id || `ticket-${idx}`,
              ticketCode: t.id || `DMY-TKT-${idx}`,
              category: catCode,
              categoryLabel: t.categoryLabel || "Laporan Lapangan",
              title: t.title || "Laporan Banjir Warga",
              location: t.location || "Indramayu",
              severity: sevLevel,
              waterLevel: t.waterLevelCode,
              waterLevelText: t.waterLevel,
              status: statusMapped,
              createdAt: "Baru saja",
              note: t.description || "Laporan terdata dari warga lapangan.",
              photos: t.photo ? [t.photo] : [],
              urgentNeeds: t.urgentNeeds || ["Bantuan Evakuasi"],
              aiScore: t.aiValidation
                ? {
                    label: t.aiValidation.category,
                    confidence: t.aiValidation.confidence,
                  }
                : undefined,
              lat: t.lat || -6.3475,
              lng: t.lng || 108.1189,
            };
          });

          setComplaints((prev) => {
            const combined = [...loadedTickets, ...prev];
            const uniqueMap = new Map();
            combined.forEach((item) => {
              if (!uniqueMap.has(item.ticketCode)) {
                uniqueMap.set(item.ticketCode, item);
              }
            });
            return Array.from(uniqueMap.values());
          });
        }
      }
    } catch (e) {
      console.warn("Gagal membaca data laporan lokal:", e);
    }
  };

  useEffect(() => {
    const active = getActiveSession();
    if (active) {
      setSession({
        name: active.fullName || active.name,
        email: active.email,
        role: active.role,
        district: active.district || "Pusdalops BPBD Indramayu",
      });
    }

    syncReportsFromStorage();

    const handleStorageChange = () => {
      syncReportsFromStorage();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("dermayu_reports_updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("dermayu_reports_updated", handleStorageChange);
    };
  }, []);

  // Telemetri Titik Pantau Air
  const telemetryPoints: MapTelemetryPoint[] = [
    {
      id: "tel-1",
      name: "Pos Pantau Bendung Rentang",
      status: "SIAGA",
      waterLevel: "485 cm (Siaga II)",
      trend: "NAIK",
      lastUpdate: "5 mnt lalu",
      lat: -6.6534,
      lng: 108.2412,
    },
    {
      id: "tel-2",
      name: "TMA Kali Cimanuk - Jembatan Bangkir",
      status: "WASPADA",
      waterLevel: "320 cm (Siaga III)",
      trend: "STABIL",
      lastUpdate: "12 mnt lalu",
      lat: -6.3789,
      lng: 108.2891,
    },
    {
      id: "tel-3",
      name: "Sensor Pasang Rob Muara Cantigi",
      status: "AWAS",
      waterLevel: "+185 cm dpl",
      trend: "NAIK",
      lastUpdate: "2 mnt lalu",
      lat: -6.3012,
      lng: 108.2567,
    },
    {
      id: "tel-4",
      name: "Sensor Elevasi Tanggul Eretan Wetan",
      status: "WASPADA",
      waterLevel: "+140 cm dpl",
      trend: "TURUN",
      lastUpdate: "8 mnt lalu",
      lat: -6.3389,
      lng: 108.1145,
    },
  ];

  // Emergency Contacts
  const emergencyContacts: EmergencyContactItem[] = [
    {
      id: "c-1",
      name: "Call Center Darurat Indramayu",
      agency: "Pemerintah Kab. Indramayu",
      phone: "112",
      description: "Panggilan bebas pulsa 24 jam untuk segala jenis bencana dan kedaruratan.",
      badge: "Bebas Pulsa 24 Jam",
    },
    {
      id: "c-2",
      name: "PUSDALOPS PB BPBD Indramayu",
      agency: "BPBD Indramayu",
      phone: "0234-272113",
      description: "Pusat komando penanganan banjir, mobilisasi armada LCR, dan tenda darurat.",
      badge: "Siaga Komando",
    },
    {
      id: "c-3",
      name: "Pos SAR Kansar Cirebon (Wilker Indramayu)",
      agency: "BASARNAS",
      phone: "0231-8302000",
      description: "Penyelamatan jiwa, evakuasi warga terjebak arus deras dan perahu terbalik.",
      badge: "Evakuasi Air",
    },
    {
      id: "c-4",
      name: "Palang Merah Indonesia (PMI) Indramayu",
      agency: "PMI Indramayu",
      phone: "0234-271118",
      description: "Bantuan ambulans medis, dapur umum bergerak, dan stok kantong darah darurat.",
      badge: "Medis & Logistik",
    },
    {
      id: "c-5",
      name: "Polres Indramayu (Siaga Banjir)",
      agency: "Kepolisian RI",
      phone: "110",
      description: "Pengamanan jalur evakuasi, rekayasa lalu lintas Pantura, patroli perumahan kosong.",
      badge: "Keamanan Rute",
    },
  ];

  // Convert complaints to map points
  const floodObstacleReports: MapReportPoint[] = FLOOD_OBSTACLES.map((obs, idx) => ({
    id: obs.id,
    ticketCode: `GEN-${String(idx + 1).padStart(3, "0")}`,
    title: obs.title,
    category: obs.zone === "PESISIR_ROB" ? "Banjir Rob" : "Luapan DAS Cimanuk",
    severity: obs.severity,
    waterLevelText: `${obs.depthCm} cm`,
    status: obs.status,
    location: obs.location,
    lat: obs.lat,
    lng: obs.lng,
    timeAgo: "Aktif Terpantau",
  }));

  const mapReportPoints: MapReportPoint[] = [
    ...floodObstacleReports,
    ...complaints.map((c) => ({
      id: c.id,
      ticketCode: c.ticketCode,
      title: c.title,
      category: c.categoryLabel,
      severity: c.severity,
      waterLevelText: c.waterLevelText,
      status:
        c.status === "ASSIGNED"
          ? "Petugas Ditugaskan"
          : c.status === "VERIFIED"
          ? "Terverifikasi"
          : "Menunggu Verifikasi",
      location: c.location,
      lat: c.lat || -6.3475,
      lng: c.lng || 108.1189,
      timeAgo: c.createdAt,
      photos: c.photos,
      note: c.note,
      aiScore: c.aiScore,
      urgentNeeds: c.urgentNeeds,
    })),
  ];

  // Untuk Petugas, tampilkan seluruh posko aktif dan yang dikelola
  const mapShelterPoints: MapShelterPoint[] = getAllPosko().map((p) => ({
    id: p.id,
    name: p.nama,
    location: p.alamat,
    district: p.kecamatan,
    distance: "Menghitung jarak...",
    capacityTotal: p.kapasitas,
    capacityFilled: p.terisi,
    status: p.status,
    contactPerson: p.kontak.pj,
    contactPhone: p.kontak.telp,
    lat: p.lat,
    lng: p.lng,
    facilities: p.fasilitas,
    kategori: p.kategori,
    foto: p.foto,
    tier: p.tier,
  }));

  return (
    <>
      <div className="w-full h-full flex flex-col flex-1 relative overflow-hidden">
        {/* PETA SPASIAL & SAR OPERASIONAL PUSDALOPS (FULL VIEWPORT GIS) */}
        <PetugasSpatialMap
          reports={mapReportPoints}
          shelters={mapShelterPoints}
          telemetry={telemetryPoints}
          onOpenReport={() => setShowReportModal(true)}
          onOpenContacts={() => setShowContactsModal(true)}
        />
      </div>

      {/* ============================================================ */}
      {/* MODAL: FORMULIR INPUT DISPATCH LAPORAN LAPANGAN              */}
      {/* ============================================================ */}
      {showReportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF5F3] flex items-center justify-center text-[#38746D]">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#132422]">
                  Lapor Titik Banjir Lapangan
                </h3>
                <p className="text-xs text-[#4B635F]">
                  Pusdalops PB BPBD Kabupaten Indramayu
                </p>
              </div>
            </div>

            {reportSubmittedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[#132422]">
                  Laporan Berhasil Disiagakan!
                </h4>
                <p className="text-xs text-[#4B635F] max-w-xs mx-auto">
                  Titik koordinat dan status ketinggian air kini muncul pada peta spasial operasional.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setReportSubmittedSuccess(true);
                  setTimeout(() => {
                    setReportSubmittedSuccess(false);
                    setShowReportModal(false);
                  }, 1200);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[#132422] mb-1.5">
                    Judul Laporan / Kedaruratan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Tanggul Jebol / Genangan Parah Blok Karanganyar"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#38746D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#132422] mb-1.5">
                      Kategori
                    </label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value as ReportCategoryCode)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#38746D]"
                    >
                      <option value="FLOOD">Banjir Luapan / Rob</option>
                      <option value="LEVEE">Tanggul Kritis</option>
                      <option value="ROAD">Akses Jalan Terputus</option>
                      <option value="DRAINAGE">Saluran Tersumbat</option>
                      <option value="OTHER">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#132422] mb-1.5">
                      Tingkat Kritis
                    </label>
                    <select
                      value={reportSeverity}
                      onChange={(e) => setReportSeverity(e.target.value as SeverityLevel)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#38746D]"
                    >
                      <option value="CRITICAL">KRITIS (Darurat)</option>
                      <option value="HIGH">TINGGI (Bahaya)</option>
                      <option value="MEDIUM">SEDANG (Waspada)</option>
                      <option value="LOW">RENDAH (Pantau)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#132422] mb-1.5">
                    Lokasi / Alamat Lapangan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama desa, blok, RT/RW, atau patokan terdekat"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#38746D]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Kirim Laporan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DAFTAR KONTAK DARURAT SAR PUSDALOPS                   */}
      {/* ============================================================ */}
      {showContactsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowContactsModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#132422]">
                  Kontak Kedaruratan & Pos SAR
                </h3>
                <p className="text-xs text-[#4B635F]">
                  Instansi Resmi Tanggap Darurat Indramayu
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {emergencyContacts.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl border border-gray-100 bg-[#F8FAF9] flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {c.badge}
                    </span>
                    <h4 className="text-xs font-bold text-[#132422] mt-1">{c.name}</h4>
                    <p className="text-[11px] text-gray-500">{c.agency}</p>
                  </div>
                  <a
                    href={`tel:${c.phone.replace(/[^0-9]/g, "")}`}
                    className="px-3.5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{c.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
