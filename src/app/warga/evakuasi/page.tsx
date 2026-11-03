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
import { EvakuasiBottomSheet } from "@/components/dashboard/EvakuasiBottomSheet";
import type {
  MapReportPoint,
  MapShelterPoint,
  MapTelemetryPoint,
} from "@/components/dashboard/WargaSpatialMap";

// Dynamic import for Leaflet Spatial Map (SSR Disabled)
const WargaSpatialMap = dynamic(
  () => import("@/components/dashboard/WargaSpatialMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-3xl bg-[#EEF5F3] border border-[#D5E4E0] flex flex-col items-center justify-center text-[#4B635F] space-y-2">
        <RefreshCw className="w-7 h-7 animate-spin text-[#38746D]" />
        <span className="text-xs font-semibold">Memuat Peta Spasial & Rute Evakuasi...</span>
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

interface ShelterItem {
  id: string;
  name: string;
  location: string;
  distance: string;
  capacityTotal: number;
  capacityFilled: number;
  facilities: string[];
  contactPerson: string;
  contactPhone: string;
  status: "TERSEDIA" | "HAMPIR_PENUH" | "PENUH";
  lat: number;
  lng: number;
}

interface EmergencyContactItem {
  id: string;
  name: string;
  agency: string;
  phone: string;
  description: string;
  badge: string;
}

export default function WargaEvakuasiPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [, setSession] = useState<UserSession>({
    name: "Warga Indramayu",
    email: "warga@dermayu.id",
    role: "warga",
    district: "Kandanghaur - Eretan Wetan",
  });

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [selectedShelterForNav, setSelectedShelterForNav] = useState<ShelterItem | null>(null);

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

  // Community Reports (Laporan warga sekitar)
  const [communityReports] = useState<ComplaintTicket[]>([
    {
      id: "c-1",
      ticketCode: "DMY-20261030-0094",
      category: "FLOOD",
      categoryLabel: "Genangan Pasang",
      title: "Air Pasang Merendam Akses Jalan Muara Cantigi",
      location: "Desa Cemara Kulon, Cantigi",
      severity: "HIGH",
      waterLevel: "THIGH",
      waterLevelText: "Setinggi Paha (75 cm)",
      status: "IN_PROGRESS",
      createdAt: "45 Menit lalu",
      note: "Petugas BPBD Pos Cantigi telah memasang rambu peringatan dan penutupan jalur.",
      photos: [],
      urgentNeeds: ["Penutupan Jalur"],
      lat: -6.2842,
      lng: 108.2635,
    },
    {
      id: "c-2",
      ticketCode: "DMY-20261030-0081",
      category: "DRAINAGE",
      categoryLabel: "Drainase Mampet",
      title: "Sumbatan Eceng Gondok di Saluran Pembuang Losarang",
      location: "Blok Jembatan Putih, Losarang",
      severity: "MEDIUM",
      waterLevel: "ANKLE",
      waterLevelText: "Semata Kaki (30 cm)",
      status: "VERIFIED",
      createdAt: "2 Jam lalu",
      note: "Dikoordinasikan dengan Dinas PUPR & Satlak Kecamatan.",
      photos: [],
      urgentNeeds: ["Alat Berat Mini"],
      lat: -6.4021,
      lng: 108.1634,
    },
  ]);

  // Shelters Data (Posko)
  const shelters: ShelterItem[] = [
    {
      id: "sh-1",
      name: "Balai Desa Eretan Wetan",
      location: "Jl. Raya Pantura No. 45, Kandanghaur",
      distance: "850 m (±4 menit jalan darat)",
      capacityTotal: 250,
      capacityFilled: 185,
      facilities: ["Dapur Umum", "Posko Medis", "Ruang Lansia", "Genset Cadangan"],
      contactPerson: "Bpk. Mulyadi (Kuwu)",
      contactPhone: "0812-3456-7890",
      status: "TERSEDIA",
      lat: -6.342,
      lng: 108.125,
    },
    {
      id: "sh-2",
      name: "SDN 1 Ilir Kandanghaur",
      location: "Jl. Nelayan Blok Ilir, Kandanghaur",
      distance: "1.4 km (±7 menit)",
      capacityTotal: 150,
      capacityFilled: 140,
      facilities: ["Ruang Tidur Kelas", "Air Bersih", "Dapur Swadaya"],
      contactPerson: "Ibu Nurhasanah (Kepsek)",
      contactPhone: "0813-9876-5432",
      status: "HAMPIR_PENUH",
      lat: -6.349,
      lng: 108.132,
    },
    {
      id: "sh-3",
      name: "Masjid Jami' Baiturrahim Losarang",
      location: "Jl. Raya Losarang No. 102",
      distance: "3.2 km (±12 menit kendaraan)",
      capacityTotal: 400,
      capacityFilled: 120,
      facilities: ["Serambi Luas", "Toilet 12 Pintu", "Ambulans Siaga", "Logistik Makanan"],
      contactPerson: "H. Ahmad Syafei (DKM)",
      contactPhone: "0821-2233-4455",
      status: "TERSEDIA",
      lat: -6.388,
      lng: 108.152,
    },
  ];

  // Telemetry Points
  const telemetryPoints: MapTelemetryPoint[] = [
    {
      id: "tel-1",
      name: "Sensor TMA Radar Muara Cantigi",
      waterLevel: "+65 cm (Siaga II)",
      status: "SIAGA",
      trend: "NAIK",
      lastUpdate: "5 Menit lalu",
      lat: -6.295,
      lng: 108.272,
    },
    {
      id: "tel-2",
      name: "Stasiun Debit Bendung Rentang Cimanuk",
      waterLevel: "310 m³/s (Normal)",
      status: "NORMAL",
      trend: "STABIL",
      lastUpdate: "12:45 WIB",
      lat: -6.471,
      lng: 108.275,
    },
    {
      id: "tel-3",
      name: "Sensor TMA Kali Cimanuk Sindang",
      waterLevel: "+140 cm (Normal)",
      status: "NORMAL",
      trend: "STABIL",
      lastUpdate: "12:30 WIB",
      lat: -6.338,
      lng: 108.309,
    },
  ];

  // Emergency Contacts
  const emergencyContacts: EmergencyContactItem[] = [
    {
      id: "ec-1",
      name: "Pusdalops PB BPBD Indramayu",
      agency: "Badan Penanggulangan Bencana Daerah",
      phone: "112",
      description: "Pusat panggilan siaga darurat evakuasi & banjir 24 jam bebas pulsa.",
      badge: "Pusat Kendali",
    },
    {
      id: "ec-2",
      name: "Basarnas Pos SAR Cirebon - Indramayu",
      agency: "Badan SAR Nasional",
      phone: "(0231) 200115",
      description: "Armada perahu karet LCR & evakuasi penyelamatan korban air deras.",
      badge: "Tim SAR",
    },
    {
      id: "ec-3",
      name: "PMI Kabupaten Indramayu",
      agency: "Palang Merah Indonesia",
      phone: "(0234) 271118",
      description: "Layanan ambulans darurat, pertolongan pertama, dan donor darah.",
      badge: "Medis Darurat",
    },
    {
      id: "ec-4",
      name: "Damkar & Penyelamatan Indramayu",
      agency: "Satpol PP & Damkar",
      phone: "(0234) 274113",
      description: "Penyedotan genangan pemukiman & evakuasi darurat.",
      badge: "Damkar",
    },
    {
      id: "ec-5",
      name: "IGD RSUD Indramayu",
      agency: "Rumah Sakit Umum Daerah",
      phone: "(0234) 272444",
      description: "Instalasi Gawat Darurat rujukan utama medis 24 jam.",
      badge: "Rumah Sakit",
    },
  ];

  // Session sync
  useEffect(() => {
    try {
      const active = getActiveSession();
      if (active) {
        setSession({
          name: active.name,
          email: active.email,
          role: active.role,
          district: active.district || "Kandanghaur - Eretan Wetan",
        });
      }
    } catch {}
  }, []);

  const handleOpenNav = (shelter?: ShelterItem) => {
    setSelectedShelterForNav(shelter || shelters[0]);
    setShowNavModal(true);
  };

  const toggleUrgentNeed = (item: string) => {
    setReportUrgentNeeds((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (reportPhotos.length + files.length > 5) {
      alert("Maksimal 5 foto per laporan.");
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setReportPhotos((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setReportPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportLocation) {
      alert("Mohon lengkapi judul kejadian dan titik lokasi.");
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randNum = String(Math.floor(1000 + Math.random() * 9000));
    const ticketCode = `DMY-${dateStr}-${randNum}`;

    const categoryLabels: Record<ReportCategoryCode, string> = {
      FLOOD: "Banjir / Genangan",
      LEVEE: "Tanggul Kritis",
      DRAINAGE: "Drainase Tersumbat",
      ROAD: "Jalan Rusak Tergenang",
      TREE: "Pohon Tumbang",
      OTHER: "Aduan Wilayah",
    };

    const waterLevelLabels: Record<WaterLevelCode, string> = {
      ANKLE: "Semata Kaki (10-30 cm)",
      KNEE: "Setinggi Lutut (40-60 cm)",
      THIGH: "Setinggi Paha (70-90 cm)",
      WAIST: "Setinggi Pinggang (100-120 cm)",
      ABOVE_CHEST: "Di Atas Dada (> 120 cm)",
    };

    const newTicket: ComplaintTicket = {
      id: Date.now().toString(),
      ticketCode,
      category: reportCategory,
      categoryLabel: categoryLabels[reportCategory],
      title: reportTitle,
      location: reportLocation,
      severity: reportSeverity,
      waterLevel: reportCategory === "FLOOD" ? reportWaterLevel : undefined,
      waterLevelText: reportCategory === "FLOOD" ? waterLevelLabels[reportWaterLevel] : undefined,
      status: "SUBMITTED",
      createdAt: "Baru saja",
      note: "Laporan telah masuk ke antrean verifikasi Pusdalops BPBD.",
      photos: reportPhotos,
      urgentNeeds: reportUrgentNeeds,
      lat: -6.3475 + (Math.random() - 0.5) * 0.02,
      lng: 108.1189 + (Math.random() - 0.5) * 0.02,
    };

    setComplaints([newTicket, ...complaints]);
    setReportSubmittedSuccess(true);

    setTimeout(() => {
      setReportSubmittedSuccess(false);
      setShowReportModal(false);
      setReportTitle("");
      setReportLocation("");
      setReportNotes("");
      setReportPhotos([]);
      setReportUrgentNeeds([]);
    }, 1500);
  };

  // Convert complaints to map points
  const mapReportPoints: MapReportPoint[] = [
    ...complaints.map((c) => ({
      id: c.id,
      ticketCode: c.ticketCode,
      title: c.title,
      category: c.categoryLabel,
      severity: c.severity,
      waterLevelText: c.waterLevelText,
      status: c.status === "ASSIGNED" ? "Petugas Ditugaskan" : "Terverifikasi",
      location: c.location,
      lat: c.lat || -6.3475,
      lng: c.lng || 108.1189,
      timeAgo: c.createdAt,
    })),
    ...communityReports.map((c) => ({
      id: c.id,
      ticketCode: c.ticketCode,
      title: c.title,
      category: c.categoryLabel,
      severity: c.severity,
      waterLevelText: c.waterLevelText,
      status: "Dalam Penanganan",
      location: c.location,
      lat: c.lat || -6.2842,
      lng: c.lng || 108.2635,
      timeAgo: c.createdAt,
    })),
  ];

  const mapShelterPoints: MapShelterPoint[] = shelters.map((s) => ({
    id: s.id,
    name: s.name,
    location: s.location,
    distance: s.distance,
    capacityTotal: s.capacityTotal,
    capacityFilled: s.capacityFilled,
    status: s.status,
    contactPerson: s.contactPerson,
    contactPhone: s.contactPhone,
    lat: s.lat,
    lng: s.lng,
    facilities: s.facilities,
  }));

  return (
    <>
      <div className="w-full h-full flex flex-col flex-1 relative overflow-hidden">
        {/* PETA SPASIAL KESIAPSIAGAAN & RUTE EVAKUASI (FULL VIEWPORT GIS) */}
        <WargaSpatialMap
          reports={mapReportPoints}
          shelters={mapShelterPoints}
          telemetry={telemetryPoints}
          onOpenReport={() => setShowReportModal(true)}
          onOpenContacts={() => setShowContactsModal(true)}
          onSelectShelter={(s) => {
            const matched = shelters.find((item) => item.id === s.id);
            if (matched) handleOpenNav(matched);
          }}
        />

        {/* BOTTOM SHEET SLIDER INTERAKTIF ALA GOOGLE MAPS (MOBILE ONLY) */}
        <EvakuasiBottomSheet
          shelters={mapShelterPoints}
          reports={mapReportPoints}
          telemetry={telemetryPoints}
          onSelectShelter={(s) => {
            const matched = shelters.find((item) => item.id === s.id);
            if (matched) handleOpenNav(matched);
          }}
          onSelectReport={(r) => {
            const matched = complaints.find((c) => c.id === r.id);
            if (matched) {
              // focus on report
            }
          }}
          onOpenReportModal={() => setShowReportModal(true)}
          onOpenContactsModal={() => setShowContactsModal(true)}
        />
      </div>

      {/* ============================================================ */}
      {/* MODAL: FORMULIR LAPOR TITIK BANJIR                           */}
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
              <div className="w-11 h-11 rounded-2xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center shrink-0">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#132422]">Lapor Titik Genangan / Kejadian</h3>
                <p className="text-xs text-[#4B635F]">Laporan langsung diteruskan ke regu posko lapangan BPBD</p>
              </div>
            </div>

            {reportSubmittedSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">Laporan Berhasil Terkirim!</h4>
                <p className="text-xs text-emerald-700">
                  Nomor tiket darurat diterbitkan. Petugas BPBD terdekat sedang memverifikasi lokasi Anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                {/* 1. Kategori Laporan */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                    Kategori Kejadian
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { code: "FLOOD", label: "Banjir / Rob", icon: Droplets },
                      { code: "LEVEE", label: "Tanggul Kritis", icon: ShieldCheck },
                      { code: "DRAINAGE", label: "Drainase Mampet", icon: Waves },
                      { code: "ROAD", label: "Jalan Tergenang", icon: Navigation },
                      { code: "TREE", label: "Pohon Tumbang", icon: AlertTriangle },
                      { code: "OTHER", label: "Aduan Lainnya", icon: FileText },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = reportCategory === cat.code;
                      return (
                        <button
                          type="button"
                          key={cat.code}
                          onClick={() => setReportCategory(cat.code as ReportCategoryCode)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#38746D] text-white border-[#38746D] shadow-xs"
                              : "bg-[#F8FAF9] text-[#4B635F] border-[#D5E4E0] hover:bg-gray-100"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-[#38746D]"}`} />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Judul Laporan */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Judul Kejadian <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Contoh: Genangan rob naik merendam jalan desa RT 02"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4E0] text-xs focus:outline-none focus:border-[#38746D] focus:ring-1 focus:ring-[#38746D] transition"
                  />
                </div>

                {/* 3. Titik Lokasi */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Titik Lokasi / Alamat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    placeholder="Contoh: Blok Karanganyar RT 04 RW 02, Desa Eretan Wetan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4E0] text-xs focus:outline-none focus:border-[#38746D] focus:ring-1 focus:ring-[#38746D] transition"
                  />
                </div>

                {/* 4. Ketinggian Air (Khusus FLOOD) */}
                {reportCategory === "FLOOD" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                      Ketinggian Air Genangan
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { code: "ANKLE", label: "Semata Kaki", val: "10-30 cm" },
                        { code: "KNEE", label: "Setinggi Lutut", val: "40-60 cm" },
                        { code: "THIGH", label: "Setinggi Paha", val: "70-90 cm" },
                        { code: "WAIST", label: "Setinggi Pinggang", val: "100-120 cm" },
                        { code: "ABOVE_CHEST", label: "Di Atas Dada", val: "> 120 cm" },
                      ].map((item) => {
                        const isSelected = reportWaterLevel === item.code;
                        return (
                          <button
                            type="button"
                            key={item.code}
                            onClick={() => setReportWaterLevel(item.code as WaterLevelCode)}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#EEF5F3] border-[#38746D] text-[#1D443F]"
                                : "bg-[#F8FAF9] border-[#D5E4E0] text-[#4B635F] hover:bg-gray-100"
                            }`}
                          >
                            <span className="block text-xs font-bold leading-tight">{item.label}</span>
                            <span className="block text-[10px] text-[#718783]">{item.val}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Kebutuhan Mendesak */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                    Kebutuhan Mendesak (Bisa pilih lebih dari satu)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Perahu Karet Evakuasi",
                      "Bantuan Medis / Lansia",
                      "Karung Pasir Penahan",
                      "Logistik Makanan Siap Saji",
                      "Penerangan / Genset",
                    ].map((item) => {
                      const isSelected = reportUrgentNeeds.includes(item);
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => toggleUrgentNeed(item)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                            isSelected
                              ? "bg-[#38746D] text-white border-[#38746D]"
                              : "bg-[#F8FAF9] text-[#4B635F] border-[#D5E4E0] hover:bg-gray-100"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Unggah Foto Bukti */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Foto Bukti Lapangan (Maks. 5 Foto)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl border border-dashed border-[#38746D] bg-[#EEF5F3] text-[#38746D] hover:bg-[#D1E5E2] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Ambil / Pilih Foto</span>
                    </button>
                    {reportPhotos.map((p, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-300">
                        <img src={p} alt="Bukti" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-0 right-0 p-0.5 bg-rose-600 text-white rounded-bl-md cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Catatan Tambahan */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Contoh: Ada 2 lansia di rumah panggung ujung gang butuh dipapah."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4E0] text-xs focus:outline-none focus:border-[#38746D] transition"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#D5E4E0] text-[#4B635F] text-xs font-bold hover:bg-gray-100 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#1D443F] hover:bg-[#24544E] text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    Kirim Laporan Sekarang
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: PANDUAN RUTE EVAKUASI KE POSKO                        */}
      {/* ============================================================ */}
      {showNavModal && selectedShelterForNav && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left max-h-[92vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setShowNavModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#132422]">Panduan Jalur Evakuasi Aman</h3>
                <p className="text-xs text-[#4B635F]">Menuju {selectedShelterForNav.name}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#EEF5F3] border border-[#A4C6C1]/50 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#132422]">
                <span>Status Posko:</span>
                <span className="text-emerald-700">{selectedShelterForNav.status}</span>
              </div>
              <div className="flex justify-between text-[#4B635F]">
                <span>Jarak dari Pesisir:</span>
                <span className="font-semibold text-[#132422]">{selectedShelterForNav.distance}</span>
              </div>
              <div className="flex justify-between text-[#4B635F]">
                <span>Sisa Kuota:</span>
                <span className="font-semibold text-[#132422]">
                  {selectedShelterForNav.capacityTotal - selectedShelterForNav.capacityFilled} Jiwa
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#132422] uppercase tracking-wider">
                Langkah Jalur Darat Bebas Genangan:
              </h4>
              <ol className="space-y-2 text-xs text-[#4B635F] list-decimal list-inside bg-[#F8FAF9] p-3.5 rounded-2xl border border-[#D5E4E0]">
                <li>Keluar dari gang pemukiman ke arah timur menuju Tanggul Nelayan.</li>
                <li>Lintasi jembatan beton sekunder (permukaan kering dan di atas elevasi pasang).</li>
                <li>Susuri jalan aspal Desa Eretan Wetan hingga pintu gerbang {selectedShelterForNav.name}.</li>
                <li>Laporkan kedatangan ke Posko Medis / Meja Registrasi Kuwu.</li>
              </ol>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={`tel:${selectedShelterForNav.contactPhone.replace(/[^0-9]/g, "")}`}
                className="flex-1 py-2.5 px-3 rounded-xl border border-[#D5E4E0] text-[#132422] hover:bg-gray-100 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Telepon Pengelola Posko</span>
              </a>
              <button
                type="button"
                onClick={() => setShowNavModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#1D443F] text-white hover:bg-[#24544E] text-xs font-bold transition"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DIREKTORI KONTAK DARURAT 24 JAM                       */}
      {/* ============================================================ */}
      {showContactsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left max-h-[92vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setShowContactsModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#132422]">Kontak Darurat Terpadu Indramayu</h3>
                <p className="text-xs text-[#4B635F]">Layanan respons darurat bencana 24 jam</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {contact.badge}
                      </span>
                      <h4 className="text-xs font-bold text-[#132422] truncate">{contact.name}</h4>
                    </div>
                    <p className="text-[11px] text-[#718783] truncate">{contact.description}</p>
                  </div>

                  <a
                    href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                    className="px-3 py-1.5 rounded-xl bg-[#1D443F] hover:bg-[#24544E] text-white text-xs font-bold shrink-0 transition"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowContactsModal(false)}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132422] text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
